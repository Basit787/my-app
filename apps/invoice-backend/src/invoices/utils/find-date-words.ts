import type { FoundDate } from "../types/found-date.js";
import type { PositionedWord } from "../types/positioned-word.js";
import { monthIndex } from "./month-index.js";
import { monthNameLike } from "./month-name-like.js";
import { wordKey } from "./word-key.js";

type DateParts = { year: number; month: number; day: number };

const partsOf = (isoDate: string): DateParts => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return { year, month, day };
};

const pad = (value: number, like: string) => (like.length === 2 ? String(value).padStart(2, "0") : String(value));
const yearLike = (year: number, like: string) =>
  like.length === 2 ? String(year % 100).padStart(2, "0") : String(year);
const fullYear = (printed: string) => (printed.length === 2 ? 2000 + Number(printed) : Number(printed));
const trimPunctuation = (text: string) => text.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

// One word: 2024-03-05, 05/03/2024, 3/5/24, 05.03.2024 or 05-Mar-2024
const matchOneWord = (text: string, target: DateParts): FoundDate["format"] | null => {
  const word = trimPunctuation(text);

  const numeric = /^(\d{1,4})([./-])(\d{1,2})\2(\d{2,4})$/.exec(word);
  if (numeric) {
    const [, first, separator, second, third] = numeric;
    if (first.length === 4) {
      const matches = Number(first) === target.year && Number(second) === target.month && Number(third) === target.day;
      if (!matches) return null;
      return (iso) => {
        const date = partsOf(iso);
        return [date.year, pad(date.month, second), pad(date.day, third)].join(separator);
      };
    }
    if (fullYear(third) !== target.year) return null;
    const dayFirst = Number(first) === target.day && Number(second) === target.month;
    const monthFirst = Number(first) === target.month && Number(second) === target.day;
    if (!dayFirst && !monthFirst) return null;
    return (iso) => {
      const date = partsOf(iso);
      const [a, b] = dayFirst ? [date.day, date.month] : [date.month, date.day];
      return [pad(a, first), pad(b, second), yearLike(date.year, third)].join(separator);
    };
  }

  const named = /^(\d{1,2})([-./])(\p{L}{3,9}\.?)\2(\d{2,4})$/u.exec(word);
  if (named) {
    const [, day, separator, month, year] = named;
    const matches =
      Number(day) === target.day && monthIndex(month) === target.month - 1 && fullYear(year) === target.year;
    if (!matches) return null;
    return (iso) => {
      const date = partsOf(iso);
      return [pad(date.day, day), monthNameLike(month, date.month - 1), yearLike(date.year, year)].join(separator);
    };
  }
  return null;
};

// Three words: "5 March 2024" or "March 5, 2024"
const matchThreeWords = (texts: string[], target: DateParts): FoundDate["format"] | null => {
  const [a, b, c] = texts.map(trimPunctuation);
  if (!/^\d{2,4}$/.test(c) || fullYear(c) !== target.year) return null;
  const comma = texts[1].endsWith(",") ? "," : "";

  if (/^\d{1,2}$/.test(a) && Number(a) === target.day && monthIndex(b) === target.month - 1) {
    return (iso) => {
      const date = partsOf(iso);
      return `${pad(date.day, a)} ${monthNameLike(b, date.month - 1)}${comma} ${yearLike(date.year, c)}`;
    };
  }
  const day = b.replace(/(st|nd|rd|th)$/i, "");
  if (monthIndex(a) === target.month - 1 && /^\d{1,2}$/.test(day) && Number(day) === target.day) {
    const suffix = b.slice(day.length);
    return (iso) => {
      const date = partsOf(iso);
      return `${monthNameLike(a, date.month - 1)} ${pad(date.day, day)}${suffix}${comma} ${yearLike(date.year, c)}`;
    };
  }
  return null;
};

// Where the date `isoDate` is printed on the original, in whatever format the invoice uses
export const findDateWords = (words: PositionedWord[], isoDate: string, used: Set<string>): FoundDate | null => {
  const target = partsOf(isoDate);
  for (let index = 0; index < words.length; index++) {
    const word = words[index];
    if (used.has(wordKey(word))) continue;

    const oneWord = matchOneWord(word.text, target);
    if (oneWord) return { words: [word], format: oneWord };

    const three = words.slice(index, index + 3);
    if (three.length === 3 && three.every((part) => part.page === word.page && !used.has(wordKey(part)))) {
      const threeWords = matchThreeWords(
        three.map((part) => part.text),
        target,
      );
      if (threeWords) return { words: three, format: threeWords };
    }
  }
  return null;
};
