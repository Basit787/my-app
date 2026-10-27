// How a word is drawn on the original, so a replacement can look the same; colours are "#rrggbb"
export type WordStyle = {
  font: "sans" | "serif" | "mono";
  bold: boolean;
  italic: boolean;
  // Font size in page units when the PDF states it; null for OCR'd words (estimated from the box instead)
  size: number | null;
  color: string;
  // What is behind the word, used to cover the old value
  background: string;
};
