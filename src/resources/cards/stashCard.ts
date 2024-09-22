import * as dotenv from "dotenv";
import { fetchCardDetails } from "@/server/actions";
import { writeFile } from "fs/promises";
import { resolve } from "path";

dotenv.config({ path: "./.env.local" });

const cards = [
    "amex-platinum",
    "amex-gold",
    "capitalone-venturex",
    "chase-sapphirereserve",

    "amex-deltareserve",
    "chase-unitedclubinfinite",

    "chase-sapphire",
    "chase-sapphirepreferred",
    "citi-aaadvantageplatinum",
    "citi-diamondpreferred",
];

(async () => {
    for (const card of cards) {
        const points = await fetchCardDetails(card);
        await writeFile(resolve(`./src/resources/cards/${card}.json`), JSON.stringify(points, null, 4));
        console.log(`done: ${card}`);
    }
})();
