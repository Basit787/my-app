import type { CoverRect } from "./cover-rect.js";

// New text over an old value: `cover` is filled with the paper colour, then `lines` are written from (x, y),
// left- or right-aligned at x, in the old text's font, weight and colour
export type EditPlacement = {
  field: string;
  page: number;
  cover: CoverRect[];
  lines: string[];
  x: number;
  y: number;
  align: "left" | "right";
  fontSize: number;
  font: "sans" | "serif" | "mono";
  bold: boolean;
  italic: boolean;
  color: string;
  // Height of the old text's line box and the step between lines, in page units
  boxHeight: number;
  lineHeight: number;
};
