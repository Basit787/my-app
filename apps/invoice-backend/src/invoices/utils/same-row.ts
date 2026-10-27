import type { Rect } from "../types/rect.js";

// Two boxes on one text line: their vertical centres are closer than most of a line height
export const sameRow = (a: Rect, b: Rect): boolean =>
  Math.abs(a.y + a.height / 2 - (b.y + b.height / 2)) < Math.max(a.height, b.height) * 0.7;
