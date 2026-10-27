import type { TextRun } from "../types/text-run.js";

// `pdftohtml -xml` output: <page width>, <fontspec id size family color> and <text top left width height font>.
// Its units aren't points (the zoom is multiplied by an internal factor), so they are scaled by the page width.
export const parsePdftohtml = (xml: string, pageWidthPoints: number): TextRun[] => {
  const pageWidth = Number(/<page [^>]*width="([\d.]+)"/.exec(xml)?.[1]);
  if (!pageWidth) throw new Error("pdftohtml returned no page");
  const zoom = pageWidth / pageWidthPoints;
  const fonts = new Map<string, { size: number; family: string; color: string }>();
  for (const match of xml.matchAll(
    /<fontspec id="(\d+)" size="([\d.-]+)" family="([^"]*)" color="(#[0-9a-fA-F]{6})"/g,
  )) {
    fonts.set(match[1], { size: Number(match[2]) / zoom, family: match[3], color: match[4].toLowerCase() });
  }

  const runs: TextRun[] = [];
  const textPattern =
    /<text top="([\d.-]+)" left="([\d.-]+)" width="([\d.-]+)" height="([\d.-]+)" font="(\d+)">(.*?)<\/text>/g;
  for (const match of xml.matchAll(textPattern)) {
    const font = fonts.get(match[5]);
    if (!font) continue;
    const [top, left, width, height] = match.slice(1, 5).map((value) => Number(value) / zoom);
    runs.push({
      x: left,
      y: top,
      width,
      height,
      size: font.size,
      family: font.family,
      color: font.color,
      // Bold and italic arrive as <b>/<i> tags when the family name alone doesn't say it
      bold: match[6].includes("<b>") || /bold|black|heavy|semibold/i.test(font.family),
      italic: match[6].includes("<i>") || /italic|oblique/i.test(font.family),
    });
  }
  return runs;
};
