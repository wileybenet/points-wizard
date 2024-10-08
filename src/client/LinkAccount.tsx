"use client";

import { usePlaidLink } from "react-plaid-link";
import { exchangePublicToken } from "../server/actions";

export default function LinkAccount({ linkToken }: { linkToken: string }) {
    const onSuccess = async (public_token: string) => {
        await exchangePublicToken(public_token);
        // location.reload();
    };

    const config: Parameters<typeof usePlaidLink>[0] = {
        token: linkToken,
        onSuccess,
    };
    const { open, ready } = usePlaidLink(config);

    return (
        <div>
            <button
                className="link-account"
                onClick={() => open()}
                disabled={!ready}
            >
                <span>Connect your credit card</span>
            </button>
        </div>
    );
}
