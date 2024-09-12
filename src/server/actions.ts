"use server";

import { cookies } from "next/headers";
import { plaidClient } from "./plaidClient";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const CARD_POINTS_DIR = resolve(__dirname, "../../../../src/resources/cards/");

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function exchangePublicToken(publicToken: string) {
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
    });

    cookies().set({
        name: "access_token",
        value: tokenResponse.data.access_token,
        secure: true,
        httpOnly: true,
    });
    cookies().set({
        name: "item_id",
        value: tokenResponse.data.item_id,
        secure: true,
        httpOnly: true,
    });

    return tokenResponse.data;
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

export async function addPoints(card: string) {
    const cardFile = `${CARD_POINTS_DIR}/${card}.json`;
    if (existsSync(cardFile)) {
        return JSON.parse(readFileSync(cardFile).toString());
    }
    const [plaidMap] = await ccApi(`creditcard-plaid-bycard/${card}`);
    const [cardData] = await ccApi(`creditcard-detail-bycard/${card}`);
    const [imageData] = await ccApi(`creditcard-card-image/${card}`);
    return { ...imageData, ...cardData, ...plaidMap };
}
