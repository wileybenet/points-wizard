"use client";

import { usePlaidLink } from "react-plaid-link";
import { exchangePublicToken } from "../server/actions";

export default function LinkAccount({ linkToken }: { linkToken: string }) {
    const onSuccess = async (public_token: string) => {
        const { access_token, item_id } = await exchangePublicToken(public_token);
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
            <button className="link-account" onClick={() => open()} disabled={!ready}>
                <span>Connect your credit card</span>
            </button>
        </div>
    );
}
