import type { PageLayout } from "../types/page-layout.js";

const decodeEntities = (text: string) =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&amp;/g, "&");

// One page of `pdftotext -bbox` output: <page width height> with <word xMin yMin xMax yMax> in points
export const parseBboxHtml = (html: string): PageLayout => {
  const page = /<page width="([\d.]+)" height="([\d.]+)"/.exec(html);
  if (!page) throw new Error("pdftotext -bbox returned no page");

  const wordPattern = /<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)">([^<]*)<\/word>/g;
  const words = [...html.matchAll(wordPattern)].map((match) => {
    const [xMin, yMin, xMax, yMax] = match.slice(1, 5).map(Number);
    return { text: decodeEntities(match[5]), x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
  });
  return { width: Number(page[1]), height: Number(page[2]), words };
};
