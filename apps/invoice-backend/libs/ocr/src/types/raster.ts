// Decoded pixels of a page or image: `channels` bytes per pixel (3 = RGB, 4 = RGBA), rows top to bottom
export type Raster = {
  width: number;
  height: number;
  channels: number;
  data: Uint8Array;
};
