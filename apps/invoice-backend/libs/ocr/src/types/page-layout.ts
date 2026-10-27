import type { LayoutWord } from "./layout-word.js";

// Where every word of one page sits, in reading order; used to put edits on the original file
export type PageLayout = {
  width: number;
  height: number;
  words: LayoutWord[];
};
