import type { WordStyle } from "@app/ocr";

// The parts of a word's style that pick the font face
export type TextStyle = Pick<WordStyle, "font" | "bold" | "italic">;
