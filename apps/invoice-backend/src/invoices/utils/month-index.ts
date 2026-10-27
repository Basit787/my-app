import { MONTHS } from "./months.js";

// 0-11 for "Mar", "march" or "MARCH"; -1 when the word isn't a month
export const monthIndex = (word: string): number => {
  const name = word.toLowerCase().replace(/\.$/, "");
  if (name.length < 3) return -1;
  return MONTHS.findIndex((month) => month.startsWith(name));
};
