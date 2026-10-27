import type { WordStyle } from "../types/word-style.js";

// The closest of the PDF standard fonts to a family name ("ABCDEF+TimesNewRomanPS-BoldMT" → serif)
export const fontKind = (family: string): WordStyle["font"] => {
  if (/courier|mono|consol|menlo/i.test(family)) return "mono";
  if (/sans/i.test(family)) return "sans";
  if (/times|serif|georgia|garamond|cambria|book|roman|minion|palatino/i.test(family)) return "serif";
  return "sans";
};
