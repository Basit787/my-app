import type { WordStyle } from "@app/ocr";

// For layouts recorded before styles were kept
export const DEFAULT_WORD_STYLE: WordStyle = {
  font: "sans",
  bold: false,
  italic: false,
  size: null,
  color: "#000000",
  background: "#ffffff",
};
