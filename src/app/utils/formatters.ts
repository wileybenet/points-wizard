export const asMoney = (num: number, decimals = 0) =>
    num.toFixed(decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
