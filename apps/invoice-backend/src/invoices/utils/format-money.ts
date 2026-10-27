// "USD 1,234.50" for the generated PDF; codes, not symbols, so the built-in PDF fonts can print every currency
export const formatMoney = (amount: number | null, currency: string | null): string => {
  if (amount === null) return "";
  const number = amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${number}` : number;
};
