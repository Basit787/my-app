// Symbols the model sometimes answers with instead of the code
const SYMBOLS: Record<string, string> = { $: "USD", "€": "EUR", "£": "GBP", "₹": "INR", "¥": "JPY" };

// An ISO 4217 code such as USD; null when the value isn't one
export const toCurrency = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (SYMBOLS[text]) return SYMBOLS[text];
  const code = text.toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : null;
};
