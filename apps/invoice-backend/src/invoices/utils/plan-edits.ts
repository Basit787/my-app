import type { PageLayout } from "@app/ocr";
import type { EditPlacement } from "../types/edit-placement.js";
import type { EditPlan } from "../types/edit-plan.js";
import type { InvoiceFields } from "../types/invoice-fields.js";
import type { MeasureText } from "../types/measure-text.js";
import type { PositionedWord } from "../types/positioned-word.js";
import { collectFieldEdits } from "./collect-field-edits.js";
import { currencyPrefix } from "./currency-prefix.js";
import { findAmountWord } from "./find-amount-word.js";
import { findDateWords } from "./find-date-words.js";
import { findTextWords } from "./find-text-words.js";
import { formatNumberLike } from "./format-number-like.js";
import { placeText } from "./place-text.js";
import { toPositionedWords } from "./to-positioned-words.js";
import { wordKey } from "./word-key.js";

// Where each change goes on the original: the old value is found by its words, then covered and rewritten
export const planEdits = (
  pages: PageLayout[],
  extracted: InvoiceFields,
  current: InvoiceFields,
  measure: MeasureText,
): EditPlan => {
  const words = toPositionedWords(pages);
  const { edits, unplaced } = collectFieldEdits(extracted, current);
  const placements: EditPlacement[] = [];
  const used = new Set<string>();

  // Each line's description, as first read, marks its row for the line's numbers
  const rowAnchors = extracted.lineItems.map((line) =>
    line.description ? findTextWords(words, line.description, new Set()) : null,
  );

  for (const edit of edits) {
    let found: PositionedWord[] | null = null;
    let text = "";
    let align: "left" | "right" = "left";

    if (edit.kind === "text") {
      found = findTextWords(words, String(edit.oldValue), used);
      text = edit.newValue === null ? "" : String(edit.newValue);
    } else if (edit.kind === "date") {
      const date = findDateWords(words, String(edit.oldValue), used);
      found = date?.words ?? null;
      text = date && edit.newValue !== null ? date.format(String(edit.newValue)) : "";
    } else {
      const anchor = edit.line === undefined ? undefined : rowAnchors[edit.line];
      // A line's number can only be told apart on its own row
      const word =
        edit.line !== undefined && !anchor
          ? null
          : findAmountWord(words, Number(edit.oldValue), used, {
              labelPattern: edit.labelPattern,
              anchor: anchor ?? undefined,
              prefer: edit.prefer,
            });
      const prefix = word ? currencyPrefix(words, word, used) : null;
      found = word ? (prefix ? [prefix, word] : [word]) : null;
      const amount = word && edit.newValue !== null ? formatNumberLike(word.text, Number(edit.newValue)) : "";
      text = prefix && amount ? `${prefix.text} ${amount}` : amount;
      align = "right";
    }

    if (!found) {
      unplaced.push(`${edit.label} (not found on the original)`);
      continue;
    }
    try {
      const page = { width: pages[found[0].page].width, words: words.filter((word) => word.page === found[0].page) };
      placements.push(placeText(edit.label, found, text, align, measure, page));
      found.forEach((word) => used.add(wordKey(word)));
    } catch {
      // The standard PDF fonts written into the file cover Western European characters only
      unplaced.push(`${edit.label} (uses characters the PDF font can't draw)`);
    }
  }

  return { pages: pages.map(({ width, height }) => ({ width, height })), placements, unplaced };
};
