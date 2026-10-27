import type { EditPlacement } from "../types/edit-placement.js";
import type { MeasureText } from "../types/measure-text.js";
import type { PositionedWord } from "../types/positioned-word.js";
import { DEFAULT_WORD_STYLE } from "./default-word-style.js";
import { sameRow } from "./same-row.js";
import { wrapText } from "./wrap-text.js";

// Font size relative to the old words' box height (boxes include ascenders and descenders)
const FONT_TO_BOX = 0.8;
const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 36;
// Small margin around each covered word so no old pixels show at the edges
const COVER_PADDING = 0.6;
// Gap kept to the next word on the line, and to the page edge, in page units
const GAP = 3;

// Covers the old words and fits `text` into their place: same position, similar size, as many lines as before.
// A longer value may use the free space on its line (towards the next word or the page edge) before it is shrunk.
export const placeText = (
  field: string,
  words: PositionedWord[],
  text: string,
  align: "left" | "right",
  measure: MeasureText,
  page: { width: number; words: PositionedWord[] },
): EditPlacement => {
  const first = words[0];
  const rows: PositionedWord[][] = [];
  for (const word of words) {
    const row = rows.find((candidate) => sameRow(candidate[0], word));
    if (row) row.push(word);
    else rows.push([word]);
  }

  const firstRow = rows[0];
  const boxHeight = Math.max(...firstRow.map((word) => word.height));
  const left = Math.min(...words.map((word) => word.x));
  const right = Math.max(...words.map((word) => word.x + word.width));
  const top = Math.min(...firstRow.map((word) => word.y));
  const lineHeight = rows.length > 1 ? (rows[rows.length - 1][0].y - top) / (rows.length - 1) : boxHeight * 1.15;
  const neighbours = page.words.filter((word) => sameRow(word, first) && !words.includes(word));
  const freeEdge =
    align === "left"
      ? Math.min(page.width - GAP, ...neighbours.filter((word) => word.x >= right).map((word) => word.x - GAP))
      : Math.max(
          GAP,
          ...neighbours.filter((word) => word.x + word.width <= left).map((word) => word.x + word.width + GAP),
        );
  const maxWidth = Math.max(right - left, align === "left" ? freeEdge - left : right - freeEdge);

  // The old text's own font and size when the PDF states them; otherwise estimated from its box
  const style = first.style ?? DEFAULT_WORD_STYLE;
  const measureStyled = (value: string, size: number) => measure(value, size, style);
  let fontSize = style.size ?? Math.min(Math.max(boxHeight * FONT_TO_BOX, MIN_FONT_SIZE), MAX_FONT_SIZE);
  let lines = wrapText(text, maxWidth, fontSize, measureStyled);
  const tooBig = () => lines.length > rows.length || lines.some((line) => measureStyled(line, fontSize) > maxWidth);
  while (fontSize > MIN_FONT_SIZE && tooBig()) {
    fontSize = Math.max(fontSize * 0.92, MIN_FONT_SIZE);
    lines = wrapText(text, maxWidth, fontSize, measureStyled);
  }

  return {
    field,
    page: first.page,
    cover: words.map((word) => ({
      x: word.x - COVER_PADDING,
      y: word.y - COVER_PADDING,
      width: word.width + COVER_PADDING * 2,
      height: word.height + COVER_PADDING * 2,
      color: (word.style ?? DEFAULT_WORD_STYLE).background,
    })),
    lines,
    x: align === "right" ? right : left,
    y: top,
    align,
    fontSize,
    font: style.font,
    bold: style.bold,
    italic: style.italic,
    color: style.color,
    boxHeight,
    lineHeight,
  };
};
