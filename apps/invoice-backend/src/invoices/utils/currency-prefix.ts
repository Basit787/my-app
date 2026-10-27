import type { PositionedWord } from "../types/positioned-word.js";
import { sameRow } from "./same-row.js";
import { wordKey } from "./word-key.js";

// "USD" in "USD 42.56": the currency word printed just before an amount, so a longer amount can push it left
export const currencyPrefix = (
  words: PositionedWord[],
  amount: PositionedWord,
  used: Set<string>,
): PositionedWord | null => {
  const previous = words.find((word) => word.page === amount.page && word.index === amount.index - 1);
  if (!previous || used.has(wordKey(previous)) || !sameRow(previous, amount)) return null;
  const gap = amount.x - (previous.x + previous.width);
  if (gap < 0 || gap > amount.height) return null;
  return /^([A-Z]{3}|[$€£₹¥])$/.test(previous.text) ? previous : null;
};
