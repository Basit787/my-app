import { MONTHS } from "./months.js";

// Month `index` styled like `original`: "Mar" → "Apr", "MARCH" → "APRIL", "march" → "april"
export const monthNameLike = (original: string, index: number): string => {
  const word = original.replace(/\.$/, "");
  const full = MONTHS[index];
  const name = word.length > 3 ? full : full.slice(0, 3);
  const dot = original.endsWith(".") ? "." : "";
  if (word === word.toUpperCase()) return name.toUpperCase() + dot;
  if (word[0] === word[0].toUpperCase()) return name[0].toUpperCase() + name.slice(1) + dot;
  return name + dot;
};
