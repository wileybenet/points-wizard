import { add, format } from "date-fns";
import { Configuration, CountryCode, LinkTokenCreateRequest, PlaidApi, PlaidEnvironments, Products } from "plaid";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

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
        // enable_multi_item_link: true,
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

export async function getTransactions(accessToken: string, attempt = 1, transactionCount = 0) {
    const request = {
        access_token: accessToken,
        start_date: format(
            add(new Date(), {
                years: -1,
            }),
            "yyyy-MM-dd"
        ),
        end_date: format(new Date(), "yyyy-MM-dd"),
        options: {
            count: 500,
        },
    };

    try {
        const response = await plaidClient.transactionsGet(request);
        const { transactions, ...rest } = response.data;
        if (transactions.length > 1) {
            if (transactionCount === transactions.length) {
                console.log(`success, returning ${transactions.length} transactions`);
                return transactions;
            }
            transactionCount = transactions.length;
            throw new Error(`plaid still syncing from FI: ${transactions.length}`);
        }
        throw new Error("not enough card data");
    } catch (err: any) {
        if (attempt <= 10) {
            console.log(`failed, retrying #${attempt} (${err.message})`);
            await sleep(attempt * 100);
            return getTransactions(accessToken, attempt + 1, transactionCount);
        }
        throw err;
    }
}
