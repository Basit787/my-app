import type { LayoutWord } from "../types/layout-word.js";
import type { PageLayout } from "../types/page-layout.js";

// Tesseract's TSV (level 1 = page, level 5 = word, pixel boxes); `scale` converts pixels to the page's units
export const parseTesseractTsv = (tsv: string, scale: number): PageLayout => {
  let width = 0;
  let height = 0;
  const words: LayoutWord[] = [];

  for (const row of tsv.split("\n").slice(1)) {
    const columns = row.split("\t");
    if (columns.length < 12) continue;
    const [level, left, top, boxWidth, boxHeight, confidence] = [0, 6, 7, 8, 9, 10].map((index) => columns[index]);
    const text = columns.slice(11).join("\t").trim();

    if (level === "1") {
      width = Number(boxWidth) * scale;
      height = Number(boxHeight) * scale;
    }
    if (level === "5" && text && Number(confidence) >= 0) {
      words.push({
        text,
        x: Number(left) * scale,
        y: Number(top) * scale,
        width: Number(boxWidth) * scale,
        height: Number(boxHeight) * scale,
      });
    }
  }
  return { width, height, words };
};
