// 1234.5 + "USD" → "$1,234.50"; without a currency just the number
export const formatAmount = (amount: number | null, currency: string | null): string => {
  if (amount === null) return "—";
  if (!currency) return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  try {
    return amount.toLocaleString(undefined, { style: "currency", currency });
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};
