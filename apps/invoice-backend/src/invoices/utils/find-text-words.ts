import type { PositionedWord } from "../types/positioned-word.js";
import { normalizeWord } from "./normalize-word.js";
import { wordKey } from "./word-key.js";

// The first run of consecutive words (also across line breaks) that spells `value`; null when it isn't on the page
export const findTextWords = (words: PositionedWord[], value: string, used: Set<string>): PositionedWord[] | null => {
  const tokens = value.split(/\s+/).map(normalizeWord).filter(Boolean);
  if (!tokens.length) return null;

  for (let start = 0; start < words.length; start++) {
    const matched: PositionedWord[] = [];
    let index = start;
    while (matched.length < tokens.length && index < words.length) {
      const word = words[index];
      const normalized = normalizeWord(word.text);
      if (!normalized) {
        index++;
        continue;
      }
      if (word.page !== words[start].page || used.has(wordKey(word)) || normalized !== tokens[matched.length]) break;
      matched.push(word);
      index++;
    }
    if (matched.length === tokens.length) return matched;
  }
  return null;
};
