"use server";

import { cookies } from "next/headers";
import { plaidClient } from "./plaidClient";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { kv } from "@vercel/kv";

const CARD_POINTS_DIR = resolve("./src/resources/cards/");
const kvAccessTokenId = "userAccessTokens";

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function exchangePublicToken(publicToken: string) {
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
    });
    const token = tokenResponse.data.access_token;

    cookies().set({
        name: "access_token",
        value: token,
        secure: true,
        httpOnly: true,
        expires: Date.now() + 8.64e7,
    });

    try {
        const keys: string[] = (await kv.get(kvAccessTokenId)) ?? [];
        const uniqueKeys = new Set(keys);
        uniqueKeys.add(token);
        await kv.set(kvAccessTokenId, [...uniqueKeys]);
    } catch (err) {
        console.error(`Failed to store access token: ${token}`);
        console.error(err);
    }

    return tokenResponse.data;
}

/**
 * There's probably somewhere else this should live, but just putting it here for now.
 */
export async function delinkAccessTokens() {
    const keys: string[] = (await kv.get(kvAccessTokenId)) ?? [];
    console.log("Keys: ", keys);
    for (const key of keys) {
        try {
            console.log("Removing key: ", key);
            await plaidClient.itemRemove({ access_token: key });
            console.log("Removed key: ", key);
            keys.splice(keys.indexOf(key), 1);
        } catch (err) {
            console.log("Failed to remove key: ", key);
            console.error(err);
        }
    }
    // If any keys weren't removed, leave them in the store
    kv.set(kvAccessTokenId, keys);
}

export async function delinkToken(token: string) {
    await plaidClient.itemRemove({ access_token: token });
    console.log("removed!");
}

export async function logOut() {
    const cookieStore = cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("item_id");
}

async function ccApi(url: string) {
    const json = await (
        await fetch(`https://${process.env.RAPID_API_HOST}/${url}`, {
            method: "GET",
            headers: {
                "x-rapidapi-host": process.env.RAPID_API_HOST!,
                "x-rapidapi-key": process.env.RAPID_API_KEY!,
            },
        })
    ).json();
    await wait(1000);
    return json;
}

export async function fetchCardDetails(card: string) {
    const [plaidMap] = await ccApi(`creditcard-plaid-bycard/${card}`);
    const [cardData] = await ccApi(`creditcard-detail-bycard/${card}`);
    const [imageData] = await ccApi(`creditcard-card-image/${card}`);
    return { ...imageData, ...cardData, ...plaidMap };
}

export async function addPoints(card: string) {
    const cardFile = `${CARD_POINTS_DIR}/${card}.json`;
    if (existsSync(cardFile)) {
        return JSON.parse(readFileSync(cardFile).toString());
    } else {
        console.log(`missing ${cardFile}`, __dirname);
    }
}
