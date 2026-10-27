import type { PageLayout } from "./page-layout.js";

// Tesseract's reading of one image: the text and where each word is
export type ImageText = {
  text: string;
  layout: PageLayout;
};
