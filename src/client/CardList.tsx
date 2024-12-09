"use client";

import React, { useState } from "react";
import { RewardStruct } from "../app/utils/card";
import styles from "./cardList.module.css";
import { asMoney } from "@/app/utils/formatters";

type SortKey = "pointsEarned" | "dollarValue" | "estimatedValue" | "annualFee";

const by = (key: SortKey) => (mapA: RewardStruct, mapB: RewardStruct) =>
    mapB[key] - mapA[key];

interface Props {
    totalSpent: number;
    pointMaps: RewardStruct[];
}

export function CardList({ totalSpent, pointMaps }: Props) {
    const [sortKey, setSortKey]: [SortKey, any] = useState("estimatedValue");
    const sort = (key: SortKey) => () => setSortKey(key);
    return (
        <div style={{ marginBottom: "80px" }}>
            <table style={{ borderWidth: 0 }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", padding: 5 }}>
                            Credit Card
                        </th>
                        <th
                            style={{ textAlign: "right", padding: 5 }}
                            onClick={sort("pointsEarned")}
                        >
                            Points
                        </th>
                        <th
                            style={{ textAlign: "right", padding: 5 }}
                            onClick={sort("dollarValue")}
                            className={styles.desktopOnlyCell}
                        >
                            Dollar Value
                        </th>
                        <th
                            style={{ textAlign: "right", padding: 5 }}
                            onClick={sort("annualFee")}
                            className={styles.desktopOnlyCell}
                        >
                            Annual Fee
                        </th>
                        <th
                            style={{ textAlign: "right", padding: 5 }}
                            onClick={sort("estimatedValue")}
                            className={styles.desktopOnlyCell}
                        >
                            Annual Savings
                        </th>
                        <th
                            style={{
                                textAlign: "right",
                                padding: 5,
                            }}
                            onClick={sort("estimatedValue")}
                            className={styles.mobileOnlyCell}
                        >
                            Value (Earnings - Fees)
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {pointMaps
                        .slice(0)
                        .sort(by(sortKey))
                        .map(
                            ({
                                cardKey,
                                cardName,
                                pointsEarned,
                                dollarValue,
                                estimatedValue,
                                annualFee,
                                cardImageUrl,
                                cardUrl,
                                isCashback,
                            }) => (
                                <tr key={cardKey}>
                                    <td
                                        style={{
                                            padding: 5,
                                        }}
                                    >
                                        <div>
                                            <a
                                                href={cardUrl}
                                                style={{
                                                    display: "flex",
                                                    gap: "5px",
                                                    alignItems: "center",
                                                    width: "fit-content",
                                                }}
                                            >
                                                <img
                                                    src={cardImageUrl}
                                                    alt={cardName}
                                                    height={50}
                                                />
                                                {cardName}
                                            </a>
                                        </div>
                                    </td>
                                    <td
                                        style={{
                                            padding: 5,
                                            textAlign: "right",
                                        }}
                                    >
                                        {isCashback
                                            ? ""
                                            : asMoney(pointsEarned)}
                                    </td>
                                    <td
                                        style={{
                                            padding: 5,
                                            textAlign: "right",
                                        }}
                                        className={styles.desktopOnlyCell}
                                    >
                                        ${asMoney(dollarValue)}
                                    </td>
                                    <td
                                        style={{
                                            padding: 5,
                                            textAlign: "right",
                                        }}
                                        className={styles.desktopOnlyCell}
                                    >
                                        ${asMoney(annualFee)}
                                    </td>
                                    <td
                                        style={{
                                            padding: 5,
                                            textAlign: "right",
                                        }}
                                        className={styles.desktopOnlyCell}
                                    >
                                        ${asMoney(estimatedValue)}
                                    </td>
                                    <td
                                        style={{
                                            padding: 5,
                                            textAlign: "right",
                                        }}
                                        className={styles.mobileOnlyCell}
                                    >
                                        ${asMoney(dollarValue)}
                                        <br />- ${asMoney(annualFee)}
                                        <br />={" "}
                                        <b>${asMoney(estimatedValue)}</b>
                                    </td>
                                </tr>
                            )
                        )}
                </tbody>
            </table>
        </div>
    );
}
