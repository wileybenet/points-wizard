import Image from "next/image";
import { cookies } from "next/headers";
import LinkAccount from "@/client/LinkAccount";
import LogOut from "@/client/LogOut";
import { getLink } from "@/server/plaidClient";
import { Cards } from "@/app/utils/card";
import { CardList } from "@/client/CardList";
import plaidLogo from "@/resources/images/plaid.svg";
import pointdexterLogo from "@/resources/images/pointdexter_logo.png";

export default async function App() {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("access_token");
    const itemId = cookieStore.get("item_id");

    if (accessToken && itemId) {
        // await Cards.loadCardPointMaps();
        // await Cards.loadTransactions(accessToken.value);
        // Cards.calculatePoints();

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
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Image src={pointdexterLogo} alt="pointdexter" height={200} />
                <Image src={plaidLogo} alt="plaid" height={100} />
            </div>
            {linkToken && <LinkAccount linkToken={linkToken} />}
        </main>
    );
}
