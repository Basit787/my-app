import type { PageLayout } from "@app/ocr";
import type { PositionedWord } from "../types/positioned-word.js";

// Every word of every page, in reading order
export const toPositionedWords = (pages: PageLayout[]): PositionedWord[] =>
  pages.flatMap((page, pageIndex) => page.words.map((word, index) => ({ ...word, page: pageIndex, index })));
