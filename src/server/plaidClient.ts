import { Configuration, CountryCode, LinkTokenCreateRequest, PlaidApi, PlaidEnvironments, Products } from "plaid";

const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || ""],
    baseOptions: {
        headers: {
            "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
            "PLAID-SECRET": process.env.PLAID_SECRET,
            "Plaid-Version": "2020-09-14",
        },
    },
});

export const plaidClient = new PlaidApi(configuration);

export async function getLink() {
    const client_user_id = `user-${Date.now()}`;
    const user = await plaidClient.userCreate({
        client_user_id,
    });
    const config: LinkTokenCreateRequest = {
        user: {
            client_user_id,
        },
        user_token: user.data.user_token,
        client_name: "pointdexter",
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: "en",
        enable_multi_item_link: true,
        redirect_uri: process.env.PLAID_REDIRECT_URI,
        transactions: {
            days_requested: 365,
        },
    };

    try {
        const createTokenResponse = await plaidClient.linkTokenCreate(config);
        return createTokenResponse.data.link_token;
    } catch (err) {
        console.log(err);
    }
}

interface Transaction {
    amount: number;
}

export async function getTransactions(accessToken: string) {
    const request = {
        access_token: accessToken,
        start_date: "2023-08-06",
        end_date: "2024-08-25",
        options: {
            count: 500,
        },
    };
    const response = await plaidClient.transactionsGet(request);
    const { transactions, ...rest } = response.data;
    return transactions;
}
