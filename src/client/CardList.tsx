"use client";

import React, { useState } from "react";
import { RewardStruct } from "../app/utils/card";

type SortKey = "pointsEarned" | "dollarValue" | "estimatedValue" | "annualFee";

const by = (key: SortKey) => (mapA: RewardStruct, mapB: RewardStruct) => mapB[key] - mapA[key];
const asMoney = (num: number, decimals = 0) => num.toFixed(decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

interface Props {
    totalSpent: number;
    pointMaps: RewardStruct[];
}

export function CardList({ totalSpent, pointMaps }: Props) {
    const [sortKey, setSortKey]: [SortKey, any] = useState("estimatedValue");
    const sort = (key: SortKey) => () => setSortKey(key);
    return (
        <div>
            <div>
                ${asMoney(totalSpent)} ${asMoney(totalSpent * 0.02)} (2% cash back)
            </div>
            <table style={{ borderWidth: 0 }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", padding: 5 }}></th>
                        <th style={{ textAlign: "left", padding: 5 }}></th>
                        <th style={{ textAlign: "left", padding: 5 }} onClick={sort("pointsEarned")}>
                            Points
                        </th>
                        <th style={{ textAlign: "left", padding: 5 }} onClick={sort("dollarValue")}>
                            Dollar Value
                        </th>
                        <th style={{ textAlign: "left", padding: 5 }} onClick={sort("annualFee")}>
                            Annual Fee
                        </th>
                        <th style={{ textAlign: "left", padding: 5 }} onClick={sort("estimatedValue")}>
                            Annual Savings
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
                            }) => (
                                <tr key={cardKey}>
                                    <td style={{ padding: 5 }}>
                                        <a href={cardUrl}>
                                            <img src={cardImageUrl} alt={cardName} height={50} />
                                        </a>
                                    </td>
                                    <td style={{ padding: 5 }}>{cardName}</td>
                                    <td style={{ padding: 5 }}>{asMoney(pointsEarned)}</td>
                                    <td style={{ padding: 5 }}>${asMoney(dollarValue)}</td>
                                    <td style={{ padding: 5 }}>${asMoney(annualFee)}</td>
                                    <td style={{ padding: 5 }}>${asMoney(estimatedValue)}</td>
                                </tr>
                            )
                        )}
                </tbody>
            </table>
        </div>
    );
}
