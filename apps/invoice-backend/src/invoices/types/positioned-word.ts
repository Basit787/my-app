import type { LayoutWord } from "@app/ocr";

// A layout word with the page it is on and its place in that page's reading order
export type PositionedWord = LayoutWord & { page: number; index: number };
