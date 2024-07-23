"use client";

import { usePlaidLink } from "react-plaid-link";
import { exchangePublicToken } from "../server-actions/actions";

export default function LinkAccount({ linkToken }: { linkToken: string }) {
    const onSuccess = async (public_token: string) => {
        const { access_token, item_id } = await exchangePublicToken(public_token);
        console.log(access_token, item_id);
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("item_id", item_id);
    };

    const config: Parameters<typeof usePlaidLink>[0] = {
        token: linkToken,
        onSuccess,
    };
    const { open, ready } = usePlaidLink(config);

    return (
        <div>
            <button onClick={() => open()} disabled={!ready}>
                Open
            </button>
        </div>
    );
}
