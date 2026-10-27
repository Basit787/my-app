import { StandardFonts } from "pdf-lib";
import type { TextStyle } from "../types/text-style.js";

const FACES = {
  sans: [
    StandardFonts.Helvetica,
    StandardFonts.HelveticaBold,
    StandardFonts.HelveticaOblique,
    StandardFonts.HelveticaBoldOblique,
  ],
  serif: [
    StandardFonts.TimesRoman,
    StandardFonts.TimesRomanBold,
    StandardFonts.TimesRomanItalic,
    StandardFonts.TimesRomanBoldItalic,
  ],
  mono: [
    StandardFonts.Courier,
    StandardFonts.CourierBold,
    StandardFonts.CourierOblique,
    StandardFonts.CourierBoldOblique,
  ],
};

// The PDF standard font for a style: Helvetica, Times or Courier, in its bold / italic face
export const standardFontName = ({ font, bold, italic }: TextStyle): StandardFonts =>
  FACES[font][(bold ? 1 : 0) + (italic ? 2 : 0)];
