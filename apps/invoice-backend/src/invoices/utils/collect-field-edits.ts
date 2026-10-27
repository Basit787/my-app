import type { FieldEdit } from "../types/field-edit.js";
import type { InvoiceFields } from "../types/invoice-fields.js";

const TEXT_FIELDS = [
  ["invoiceNumber", "Invoice number"],
  ["vendorName", "Vendor name"],
  ["vendorAddress", "Vendor address"],
  ["vendorTaxId", "Vendor tax ID"],
  ["customerName", "Customer name"],
  ["customerAddress", "Customer address"],
  ["currency", "Currency"],
] as const;

const DATE_FIELDS = [
  ["invoiceDate", "Date"],
  ["dueDate", "Due date"],
] as const;

// Each total with the word that usually labels it on the same line
const AMOUNT_FIELDS = [
  ["subtotal", "Subtotal", /^(sub-?total|net|subtotal)/],
  ["taxAmount", "Tax", /^(tax|vat|gst|iva|mwst|tva|sales)/],
  ["totalAmount", "Total", /^(total|grand|amount|balance)/],
] as const;

const LINE_NUMBERS = [
  ["quantity", "quantity", "left"],
  ["unitPrice", "unit price", "left"],
  ["amount", "amount", "right"],
] as const;

type CollectedEdits = { edits: FieldEdit[]; unplaced: string[] };

// What changed between the fields as first read and the current ones; a value the file never showed can't be placed
export const collectFieldEdits = (extracted: InvoiceFields, current: InvoiceFields): CollectedEdits => {
  const edits: FieldEdit[] = [];
  const unplaced: string[] = [];
  const add = (edit: Omit<FieldEdit, "oldValue"> & { oldValue: string | number | null }) => {
    if (edit.oldValue === edit.newValue) return;
    if (edit.oldValue === null || edit.oldValue === "") {
      unplaced.push(`${edit.label} (not printed on the original)`);
      return;
    }
    edits.push({ ...edit, oldValue: edit.oldValue });
  };

  for (const [key, label] of TEXT_FIELDS) {
    add({ label, kind: "text", oldValue: extracted[key], newValue: current[key] });
  }
  for (const [key, label] of DATE_FIELDS) {
    add({ label, kind: "date", oldValue: extracted[key], newValue: current[key] });
  }
  for (const [key, label, labelPattern] of AMOUNT_FIELDS) {
    add({ label, kind: "amount", oldValue: extracted[key], newValue: current[key], labelPattern });
  }

  const lineCount = Math.max(extracted.lineItems.length, current.lineItems.length);
  for (let line = 0; line < lineCount; line++) {
    const before = extracted.lineItems[line];
    const after = current.lineItems[line];
    if (!before) {
      unplaced.push(`Line ${line + 1} (added; the original has no room for a new line)`);
      continue;
    }
    // A removed line is blanked out on the original
    add({
      label: `Line ${line + 1} description`,
      kind: "text",
      oldValue: before.description,
      newValue: after?.description ?? null,
      line,
    });
    for (const [key, name, prefer] of LINE_NUMBERS) {
      add({
        label: `Line ${line + 1} ${name}`,
        kind: "amount",
        oldValue: before[key],
        newValue: after?.[key] ?? null,
        line,
        prefer,
      });
    }
  }
  return { edits, unplaced };
};
