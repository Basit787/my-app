import type { PositionedWord } from "../types/positioned-word.js";

// Identifies a word across pages, so one word is never replaced by two edits
export const wordKey = (word: PositionedWord) => `${word.page}:${word.index}`;
