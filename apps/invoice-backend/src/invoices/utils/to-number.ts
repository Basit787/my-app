// 99, "1,234.56", "1.234,56" or "$ 99" as a number; null when it isn't one
export const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  let cleaned = value.replace(/[^\d.,-]/g, "");
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  if (lastComma > lastDot) {
    // A comma followed by one or two digits is the decimal separator ("12,50"), otherwise a thousands one ("1,250")
    const digitsAfterComma = cleaned.length - lastComma - 1;
    cleaned = digitsAfterComma <= 2 ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(/,/g, "");
  } else {
    cleaned = cleaned.replace(/,/g, "");
  }

  if (!/\d/.test(cleaned)) return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
};
