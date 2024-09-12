import Image from "next/image";
import { cookies } from "next/headers";
import LinkAccount from "@/client/LinkAccount";
import LogOut from "@/client/LogOut";
import { getLink } from "@/server/plaidClient";
import { Cards } from "@/app/utils/card";
import { CardList } from "@/client/CardList";
import plaidLogo from "@/resources/images/plaid.svg";

export default async function App() {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("access_token");
    const itemId = cookieStore.get("item_id");

    if (accessToken && itemId) {
        await Cards.loadCardPointMaps();
        await Cards.loadTransactions(accessToken.value);
        Cards.calculatePoints();

        return (
            <div>
                <div style={{ position: "fixed", bottom: 0, width: "100%" }}>
                    <LogOut />
                    <div style={{ float: "right", textAlign: "right" }}>
                        {accessToken.value}
                        <br />
                        {itemId.value}
                    </div>
                </div>
                <div>
                    transactions: {Cards.transactions.length} ({Cards.firstTransactionDate})
                </div>
                <br />
                <CardList totalSpent={Cards.totalSpent} pointMaps={Cards.pointMaps} />
            </div>
        );
    }

    const linkToken = await getLink();

    return (
        <main>
            App!!!
            <Image src={plaidLogo} alt="plaid" height={100} />
            {linkToken && <LinkAccount linkToken={linkToken} />}
        </main>
    );
}
