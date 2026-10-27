// "USD 1,234.50" (or "1,234.50" without a currency), the way the backend writes amounts into the PDF
export const formatMoney = (amount: number, currency: string | null): string => {
  const number = amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${number}` : number;
};
