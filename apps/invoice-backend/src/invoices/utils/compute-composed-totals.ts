import type { ComposeDataDto } from "../dto/compose-data.dto.js";
import type { ComposedTotals } from "../types/composed-totals.js";

const cents = (value: number) => Math.round(value * 100) / 100;

// Subtotal from quantity × unit price per line, tax from the rate, rounded to cents at each step
export const computeComposedTotals = (data: ComposeDataDto): ComposedTotals => {
  const subtotal = cents(data.lineItems.reduce((sum, line) => sum + cents(line.quantity * line.unitPrice), 0));
  const taxAmount = cents((subtotal * data.taxRate) / 100);
  return { subtotal, taxAmount, totalAmount: cents(subtotal + taxAmount) };
};
