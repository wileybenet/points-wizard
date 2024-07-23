"use server";

import { cookies } from "next/headers";
import { plaidClient } from "./plaidClient";

const PLAID_POINTS = `https://${process.env.RAPID_API_HOST}/creditcard-plaid-bycard`;

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

export async function addPoints(card: string) {
    return (
        await fetch(`${PLAID_POINTS}/${card}`, {
            method: "GET",
            headers: {
                "x-rapidapi-host": process.env.RAPID_API_HOST!,
                "x-rapidapi-key": process.env.RAPID_API_KEY!,
            },
        })
    ).json();
}
