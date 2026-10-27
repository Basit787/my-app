import type { PositionedWord } from "./positioned-word.js";

// A date printed on the original, and how to print another date the same way
export type FoundDate = {
  words: PositionedWord[];
  format: (isoDate: string) => string;
};
