import type { PositionedWord } from "../types/positioned-word.js";
import { isNumberWord } from "./is-number-word.js";
import { normalizeWord } from "./normalize-word.js";
import { sameRow } from "./same-row.js";
import { toNumber } from "./to-number.js";
import { wordKey } from "./word-key.js";

type AmountSearch = {
  // Totals: a word on the same line, left of the amount, that matches (e.g. "Total")
  labelPattern?: RegExp;
  // Line items: the row's description; only numbers right of it on the same line count
  anchor?: PositionedWord[];
  prefer?: "left" | "right";
};

// The word showing `value` (as printed: "1,234.50", "$1.234,50"…); null when it isn't there or can't be told apart
export const findAmountWord = (
  words: PositionedWord[],
  value: number,
  used: Set<string>,
  { labelPattern, anchor, prefer = "right" }: AmountSearch = {},
): PositionedWord | null => {
  let candidates = words.filter((word) => {
    if (used.has(wordKey(word)) || !isNumberWord(word.text)) return false;
    const number = toNumber(word.text);
    return number !== null && Math.abs(number - value) < 0.005;
  });
  if (!candidates.length) return null;

  if (anchor) {
    const first = anchor[0];
    const descriptionEnd = Math.max(...anchor.map((word) => word.x + word.width));
    candidates = candidates.filter(
      (word) => word.page === first.page && sameRow(word, first) && word.x >= descriptionEnd,
    );
    if (!candidates.length) return null;
    const byX = [...candidates].sort((a, b) => a.x - b.x);
    return prefer === "left" ? byX[0] : byX[byX.length - 1];
  }

  if (labelPattern) {
    const labelled = candidates.filter((candidate) =>
      words.some(
        (word) =>
          word.page === candidate.page &&
          word.x < candidate.x &&
          sameRow(word, candidate) &&
          labelPattern.test(normalizeWord(word.text)),
      ),
    );
    if (labelled.length) return labelled[labelled.length - 1];
  }
  // Totals are printed last on an invoice
  return candidates[candidates.length - 1];
};
