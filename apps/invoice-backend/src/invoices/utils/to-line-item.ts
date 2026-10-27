import type { InvoiceLineItem } from "../types/invoice-line-item.js";
import { toAmount } from "./to-amount.js";
import { toNumber } from "./to-number.js";
import { toText } from "./to-text.js";

// One line from the model's or the XML's values
export const toLineItem = (raw: Record<string, unknown>): InvoiceLineItem => ({
  description: toText(raw.description, 500) ?? "",
  quantity: toNumber(raw.quantity),
  unitPrice: toAmount(raw.unitPrice),
  amount: toAmount(raw.amount),
});
