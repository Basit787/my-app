import { toNumber } from "./to-number.js";

// Largest value the DECIMAL(14, 2) columns hold
const MAX_AMOUNT = 999_999_999_999.99;

// A money value rounded to cents; null when it isn't a number or doesn't fit the column
export const toAmount = (value: unknown): number | null => {
  const number = toNumber(value);
  if (number === null || Math.abs(number) > MAX_AMOUNT) return null;
  return Math.round(number * 100) / 100;
};
