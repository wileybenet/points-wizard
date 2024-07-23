import { cookies } from "next/headers";
import LinkAccount from "@/client/LinkAccount";
import LogOut from "@/client/LogOut";
import { getLink, getTransactions } from "@/server-actions/plaidClient";
import { addPoints } from "@/server-actions/actions";

interface RewardStruct {
    plaidDetailed: string;
    earnMultiplier: number;
}

export default async function App() {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("access_token");
    const itemId = cookieStore.get("item_id");

    if (accessToken && itemId) {
        const transactions = await getTransactions(accessToken.value);
        console.log(transactions);
        const points = await addPoints("amex-gold");
        const pointMap = points[0].plaidDetailed.reduce(
            (acc: Record<string, number>, { plaidDetailed, earnMultiplier }: RewardStruct) => ({
                ...acc,
                [plaidDetailed]: earnMultiplier,
            }),
            {}
        );
        return (
            <div>
                <LogOut />
                {accessToken.value} {itemId.value}
                <div>{transactions.length}</div>
                <div>
                    {transactions.map((transaction) => (
                        <div key={transaction.transaction_id}>
                            {transaction.name}: {transaction.amount} (
                            {pointMap[transaction.personal_finance_category!.detailed]})
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const linkToken = await getLink();

    return (
        <main>
            App!!!
            <LinkAccount linkToken={linkToken} />
        </main>
    );
}
