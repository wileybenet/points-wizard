import { Transaction } from "plaid";
import { addPoints } from "../../server/actions";
import { getTransactions } from "../../server/plaidClient";
import { differenceInDays } from "date-fns/fp";

const CARDS = [
    "amex-deltareserve",
    "amex-gold",
    "amex-platinum",
    "capitalone-venturex",
    // "chase-sapphire",    no such thing anymore
    "chase-sapphirepreferred",
    "chase-sapphirereserve",
    "chase-unitedclubinfinite",
    "citi-aaadvantageplatinum",
    "citi-diamondpreferred",
    "wellsfargo-activecash",
];

interface DetailedReward {
    plaidDetailed: string;
    earnMultiplier: number;
    isDateLimit: number;
    limitBeginDate: string;
    limitEndDate: string;
    isSpendLimit: number;
    spendLimit: number;
    spendLimitResetPeriod: string;
}

export interface RewardStruct {
    cardKey: string;
    cardName: string;
    baseSpendEarnValuation: number;
    plaidDetailed: DetailedReward[];
    multiplierByPlaidDetailed: { [key: string]: number };
    pointsEarned: number;
    annualFee: number;
    cardImageUrl: string;
    dollarValue: number;
    estimatedValue: number;
    cardUrl: string;
    isCashback: boolean;
}

export class Cards {
    static transactions: Transaction[];
    static pointMaps: RewardStruct[] = [];
    static pointMapsIndex: { [key: string]: RewardStruct } = {};
    static totalSpent: number;
    static totalSpentAnnualized: number;
    static firstTransactionDate: string;
    static annualizedFactor: number;
    static categorySpend: { [key: string]: number };

    static async loadCardPointMaps() {
        Cards.pointMaps = await Promise.all(CARDS.map(addPoints));
        Cards.pointMaps.forEach((map) => {
            map.multiplierByPlaidDetailed = map.plaidDetailed.reduce(
                (acc, { plaidDetailed, earnMultiplier }) => ({
                    ...acc,
                    [plaidDetailed]: earnMultiplier,
                }),
                {}
            );
        });
        Cards.pointMapsIndex = Cards.pointMaps.reduce(
            (acc, map) => ({ ...acc, [map.cardKey]: map }),
            {}
        );
    }
    static async loadTransactions(accessToken: string) {
        Cards.transactions = (await getTransactions(accessToken)).filter(
            ({ personal_finance_category }) =>
                personal_finance_category?.detailed !==
                "LOAN_PAYMENTS_CREDIT_CARD_PAYMENT"
        );
        const firstDate = new Date(Cards.transactions[0].date);
        const lastDate = new Date(
            Cards.transactions[Cards.transactions.length - 1].date
        );
        const durationDays = differenceInDays(lastDate, firstDate);
        Cards.totalSpent = Cards.transactions.reduce((a, x) => a + x.amount, 0);
        Cards.annualizedFactor = 365 / durationDays;
        Cards.totalSpentAnnualized = Cards.annualizedFactor * Cards.totalSpent;
        Cards.firstTransactionDate =
            Cards.transactions[Cards.transactions.length - 1].date;
    }
    static calculatePoints() {
        Cards.pointMaps.forEach((map) => {
            map.pointsEarned =
                Cards.points(map.cardKey) * Cards.annualizedFactor;
            map.dollarValue =
                (map.pointsEarned * map.baseSpendEarnValuation) / 100;
            map.estimatedValue = map.dollarValue - map.annualFee;
        });
    }
    static points(cardName: string) {
        const map = Cards.pointMapsIndex[cardName];
        return Cards.transactions.reduce((total, transaction) => {
            let multiplier =
                map.multiplierByPlaidDetailed[
                    transaction.personal_finance_category!.detailed
                ];
            if (!multiplier) {
                multiplier = map.multiplierByPlaidDetailed["*"] || 1;
            }
            return total + transaction.amount * multiplier;
        }, 0);
    }
    static calculateSpendByCategory() {
        const spendByCategory = Cards.transactions.reduce(
            (acc, { amount, personal_finance_category }) => {
                const category = personal_finance_category?.primary || "*";
                return {
                    ...acc,
                    [category]: (acc[category] || 0) + amount,
                };
            },
            {} as { [key: string]: number }
        );
        Cards.categorySpend = spendByCategory;
    }
}
