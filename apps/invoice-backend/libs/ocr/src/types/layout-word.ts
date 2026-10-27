import type { WordStyle } from "./word-style.js";

// One word as drawn on a page, top-left origin, in the page's units (points for PDF pages, pixels for images)
export type LayoutWord = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // Missing in layouts recorded before styles were kept
  style?: WordStyle;
};
