import type { Raster } from "../types/raster.js";

type BoxSample = { ink: number[]; background: number[]; inkShare: number };

const luminance = (rgb: number[]) => 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
const average = (pixels: number[][]) =>
  [0, 1, 2].map((channel) => pixels.reduce((sum, pixel) => sum + pixel[channel], 0) / Math.max(pixels.length, 1));

// Colours inside a box of a raster (pixel coordinates): the darkest pixels are the ink, the brightest the paper;
// `inkShare` (how much of the box is ink) tells bold text from regular text of the same size
export const sampleBox = (raster: Raster, x: number, y: number, width: number, height: number): BoxSample | null => {
  const left = Math.max(0, Math.floor(x));
  const top = Math.max(0, Math.floor(y));
  const right = Math.min(raster.width, Math.ceil(x + width));
  const bottom = Math.min(raster.height, Math.ceil(y + height));
  if (right - left < 2 || bottom - top < 2) return null;

  const pixels: number[][] = [];
  for (let row = top; row < bottom; row++) {
    for (let column = left; column < right; column++) {
      const offset = (row * raster.width + column) * raster.channels;
      pixels.push([raster.data[offset], raster.data[offset + 1], raster.data[offset + 2]]);
    }
  }
  const byBrightness = pixels.map((pixel) => ({ pixel, light: luminance(pixel) })).sort((a, b) => a.light - b.light);
  const ink = average(byBrightness.slice(0, Math.max(1, Math.floor(pixels.length * 0.08))).map((item) => item.pixel));
  const background = average(byBrightness.slice(Math.floor(pixels.length * 0.6)).map((item) => item.pixel));
  const threshold = (luminance(ink) + luminance(background)) / 2;
  const inkShare = byBrightness.filter((item) => item.light < threshold).length / pixels.length;
  return { ink, background, inkShare };
};
