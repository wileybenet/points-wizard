import Image from "next/image";
import { cookies } from "next/headers";
import LinkAccount from "@/client/LinkAccount";
import LogOut from "@/client/LogOut";
import { getLink } from "@/server/plaidClient";
import { Cards } from "@/app/utils/card";
import { CardList } from "@/client/CardList";
import plaidLogo from "@/resources/images/plaid.svg";
import pointdexterLogo from "@/resources/images/pointdexter_logo_transparent.png";
import { asMoney } from "./utils/formatters";
import { differenceInCalendarDays } from "date-fns";

export default async function App() {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("access_token");

    if (accessToken) {
        await Cards.loadCardPointMaps();
        await Cards.loadTransactions(accessToken.value);
        Cards.calculatePoints();
        await Cards.calculateSpendByCategory();

        return (
            <>
                <span className="wordmark-small">PointDexter</span>
                <div
                    style={{
                        position: "fixed",
                        bottom: "10px",
                        right: "10px",
                        textAlign: "right",
                    }}
                >
                    <LogOut />
                </div>
                <div className="results">
                    <SpendingBreakdown />
                    <CardList
                        totalSpent={Cards.totalSpent}
                        pointMaps={Cards.pointMaps}
                    />
                </div>
            </>
        );
    }

    const linkToken = await getLink();

    return (
        <main className="intro-content">
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Image
                    src={pointdexterLogo}
                    alt="pointdexter"
                    height={180}
                    style={{
                        paddingLeft: "20px",
                        marginRight: "20px",
                        paddingBottom: "15px",
                    }}
                />
                <span className="wordmark">PointDexter</span>
            </div>
            <span className="plus">+</span>
            <Image
                src={plaidLogo}
                alt="plaid"
                height={200}
                style={{ marginTop: "-10px" }}
            />

            {linkToken && <LinkAccount linkToken={linkToken} />}
            <div
                style={{
                    textAlign: "center",
                    marginTop: "10vh",
                    padding: "20px",
                }}
            >
                <p>
                    We use{" "}
                    <a href="https://plaid.com/what-is-plaid/" target="_blank">
                        Plaid
                    </a>{" "}
                    to analyze your spending and caclulate the best credit card
                    for you.
                </p>
                <p>We don&apos;t store your data on our servers. Ever.</p>
                <p>Your data stays on your device in case you need it.</p>
                <p>You can clear it any time.</p>
            </div>
        </main>
    );
}

function SpendingBreakdown() {
    return (
        <div
            style={{
                margin: "20px 0px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            <h3>Your Spending</h3>
            <div>
                In the last{" "}
                <strong>
                    {differenceInCalendarDays(
                        new Date(),
                        new Date(Cards.firstTransactionDate)
                    )}{" "}
                    days,
                </strong>{" "}
                you made{" "}
                <strong>{Cards.transactions.length} transactions</strong>{" "}
                totaling <strong>${asMoney(Cards.totalSpent)}</strong>.
            </div>
            <br />
            <div>
                <table
                    style={{
                        borderSpacing: "10px 2px",
                    }}
                >
                    <thead>
                        <tr>
                            <th
                                style={{
                                    textAlign: "left",
                                }}
                            >
                                Category
                            </th>
                            <th style={{ textAlign: "left" }}>Spend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(Cards.categorySpend)
                            .sort((a, b) => (a[1] > b[1] ? -1 : 1))
                            .map(([category, amount]) => (
                                <tr key={category}>
                                    <td>{category}</td>
                                    <td>${asMoney(amount)}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            <br />
            <div>
                We&apos;ve annulized your spending for the calculations below.
            </div>
            <br />
        </div>
    );
}
