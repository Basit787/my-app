// One changed value: where to look for the old one on the original, and what replaces it (null: blank it out)
export type FieldEdit = {
  label: string;
  kind: "text" | "date" | "amount";
  oldValue: string | number;
  newValue: string | number | null;
  // Totals: a word that labels the amount on the same line, e.g. /^total/
  labelPattern?: RegExp;
  // Line items: which line (its description anchors the row) and which number on the row to take
  line?: number;
  prefer?: "left" | "right";
};
