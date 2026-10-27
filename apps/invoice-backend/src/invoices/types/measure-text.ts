import type { TextStyle } from "./text-style.js";

// Width of `text` at `size` in the standard PDF font closest to `style`
export type MeasureText = (text: string, size: number, style: TextStyle) => number;
