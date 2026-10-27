import type { BlockKind } from "../types/block-kind";
import type { BlockStyle } from "../types/block-style";

type CatalogEntry = {
  label: string;
  description: string;
  width: number;
  height?: number;
  text?: string;
  style: Partial<BlockStyle>;
};

// What each block is called in the palette and how it starts out when dropped on the page
export const BLOCK_CATALOG: Record<BlockKind, CatalogEntry> = {
  logo: { label: "Logo", description: "Your logo image", width: 90, height: 90, style: {} },
  title: {
    label: "Title",
    description: "A big heading",
    width: 245,
    text: "INVOICE",
    style: { fontSize: 28, bold: true },
  },
  text: { label: "Text", description: "Any text you type", width: 240, text: "Your text", style: {} },
  details: { label: "Invoice details", description: "Number, date, due date", width: 245, style: { align: "right" } },
  from: { label: "From", description: "Your business", width: 230, style: {} },
  billTo: { label: "Bill to", description: "Your customer", width: 230, style: {} },
  lineItems: { label: "Line items", description: "Table of what you bill", width: 495, style: {} },
  totals: { label: "Totals", description: "Subtotal, tax and total", width: 245, style: {} },
  notes: { label: "Notes", description: "Payment terms, thanks…", width: 495, style: { fontSize: 9 } },
  divider: { label: "Divider", description: "A horizontal line", width: 495, height: 1, style: { color: "#cccccc" } },
};
