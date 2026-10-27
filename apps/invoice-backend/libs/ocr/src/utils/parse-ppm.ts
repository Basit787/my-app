import type { Raster } from "../types/raster.js";

// A binary PPM (P6, what `pdftoppm -ppm` writes): "P6 <width> <height> <max>" then RGB bytes
export const parsePpm = (buffer: Buffer): Raster => {
  const header: string[] = [];
  let offset = 0;
  while (header.length < 4) {
    while (/\s/.test(String.fromCharCode(buffer[offset]))) offset++;
    if (buffer[offset] === 0x23) {
      while (buffer[offset] !== 0x0a) offset++;
      continue;
    }
    let token = "";
    while (!/\s/.test(String.fromCharCode(buffer[offset]))) token += String.fromCharCode(buffer[offset++]);
    header.push(token);
  }
  if (header[0] !== "P6") throw new Error(`Not a binary PPM (${header[0]})`);
  // One whitespace byte separates the header from the pixels
  offset++;
  const width = Number(header[1]);
  const height = Number(header[2]);
  return { width, height, channels: 3, data: buffer.subarray(offset, offset + width * height * 3) };
};
