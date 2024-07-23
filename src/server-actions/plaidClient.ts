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
    const configs: LinkTokenCreateRequest = {
        user: {
            // This should correspond to a unique id for the current user.
            client_user_id: "user-id",
        },
        client_name: "Plaid Quickstart",
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: "en",
    };

    if (process.env.PLAID_REDIRECT_URI !== "") {
        configs.redirect_uri = process.env.PLAID_REDIRECT_URI;
    }

    const createTokenResponse = await plaidClient.linkTokenCreate(configs);
    return createTokenResponse.data.link_token;
}

interface Transaction {
    amount: number;
}

export async function getTransactions(accessToken: string) {
    let cursor;

    // New transaction updates since "cursor"
    let added: Transaction[] = [];
    let modified: Transaction[] = [];
    let hasMore = true;
    const request = {
        access_token: accessToken,
        cursor: cursor,
    };
    const response = await plaidClient.transactionsSync(request);
    const data = response.data;
    console.log(response.data);
    // Add this page of results
    added = added.concat(data.added);
    modified = modified.concat(data.modified);
    hasMore = data.has_more;
    // Update cursor to the next cursor
    cursor = data.next_cursor;
    return response.data.added;
}
