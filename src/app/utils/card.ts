import { Transaction } from "plaid";
import { addPoints } from "../../server/actions";
import { getTransactions } from "../../server/plaidClient";

const CARDS = [
    "amex-deltareserve",
    "amex-gold",
    "amex-platinum",
    "capitalone-venturex",
    "chase-sapphire",
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
    static firstTransactionDate: string;
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
        Cards.pointMapsIndex = Cards.pointMaps.reduce((acc, map) => ({ ...acc, [map.cardKey]: map }), {});
    }
    static async loadTransactions(accessToken: string) {
        Cards.transactions = (await getTransactions(accessToken)).filter(
            ({ personal_finance_category }) =>
                personal_finance_category?.detailed !== "LOAN_PAYMENTS_CREDIT_CARD_PAYMENT"
        );
        Cards.totalSpent = Cards.transactions.reduce((a, x) => a + x.amount, 0);
        Cards.firstTransactionDate = Cards.transactions[Cards.transactions.length - 1].date;
    }
    static calculatePoints() {
        Cards.pointMaps.forEach((map) => {
            map.pointsEarned = Cards.points(map.cardKey);
            map.dollarValue = (map.pointsEarned * map.baseSpendEarnValuation) / 100;
            map.estimatedValue = map.dollarValue - map.annualFee;
        });
    }
    static points(cardName: string) {
        const map = Cards.pointMapsIndex[cardName];
        return Cards.transactions.reduce((total, transaction) => {
            let multiplier = map.multiplierByPlaidDetailed[transaction.personal_finance_category!.detailed];
            if (!multiplier) {
                multiplier = map.multiplierByPlaidDetailed["*"] || 1;
            }
            return total + transaction.amount * multiplier;
        }, 0);
    }
}
