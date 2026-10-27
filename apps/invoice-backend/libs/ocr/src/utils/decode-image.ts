import jpeg from "jpeg-js";
import { PNG } from "pngjs";
import type { Raster } from "../types/raster.js";

// Pixels of an uploaded PNG or JPEG; null for formats without a decoder here (TIFF)
export const decodeImage = (buffer: Buffer, contentType: string): Raster | null => {
  if (contentType === "image/png") {
    const png = PNG.sync.read(buffer);
    return { width: png.width, height: png.height, channels: 4, data: png.data };
  }
  if (contentType === "image/jpeg") {
    const image = jpeg.decode(buffer, { useTArray: true, formatAsRGBA: false });
    return { width: image.width, height: image.height, channels: 3, data: image.data };
  }
  return null;
};
