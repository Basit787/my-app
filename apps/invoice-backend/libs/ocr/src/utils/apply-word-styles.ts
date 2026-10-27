import type { PageLayout } from "../types/page-layout.js";
import type { Raster } from "../types/raster.js";
import type { TextRun } from "../types/text-run.js";
import type { WordStyle } from "../types/word-style.js";
import { fontKind } from "./font-kind.js";
import { sampleBox } from "./sample-box.js";
import { toHex } from "./to-hex.js";

// A word whose ink covers this much more of its box than the page's typical word is bold (OCR has no font data)
const BOLD_INK_RATIO = 1.35;

const luminance = (rgb: number[]) => 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
// Anti-aliasing greys pure black text and white paper slightly; snap those back
const inkColor = (rgb: number[]) => (luminance(rgb) < 60 ? "#000000" : toHex(rgb));
const paperColor = (rgb: number[]) => (luminance(rgb) > 238 ? "#ffffff" : toHex(rgb));

const runAt = (runs: TextRun[], x: number, y: number) =>
  runs.find((run) => x >= run.x - 1 && x <= run.x + run.width + 1 && y >= run.y - 1 && y <= run.y + run.height + 1);

// A style for every word: font, size and colour from the PDF's own text runs when it has them, otherwise
// estimated from the pixels (scans, photos); the background always comes from the pixels when there are some.
// `pixelsPerUnit` converts layout units to raster pixels.
export const applyWordStyles = (
  layout: PageLayout,
  runs: TextRun[] | null,
  raster: Raster | null,
  pixelsPerUnit: number,
): PageLayout => {
  const samples = layout.words.map((word) =>
    raster
      ? sampleBox(
          raster,
          word.x * pixelsPerUnit,
          word.y * pixelsPerUnit,
          word.width * pixelsPerUnit,
          word.height * pixelsPerUnit,
        )
      : null,
  );
  const inkShares = samples.flatMap((sample) => (sample ? [sample.inkShare] : [])).sort((a, b) => a - b);
  const typicalInk = inkShares[Math.floor(inkShares.length / 2)] ?? 0;

  const words = layout.words.map((word, index) => {
    const run = runs ? runAt(runs, word.x + word.width / 2, word.y + word.height / 2) : undefined;
    const sample = samples[index];
    const style: WordStyle = {
      font: run ? fontKind(run.family) : "sans",
      bold: run ? run.bold : !!sample && typicalInk > 0 && sample.inkShare > typicalInk * BOLD_INK_RATIO,
      italic: run?.italic ?? false,
      size: run?.size ?? null,
      color: run?.color ?? (sample ? inkColor(sample.ink) : "#000000"),
      background: sample ? paperColor(sample.background) : "#ffffff",
    };
    return { ...word, style };
  });
  return { ...layout, words };
};
