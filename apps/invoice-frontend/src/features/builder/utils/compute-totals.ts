import type { BuilderData } from "../types/builder-data";

const cents = (value: number) => Math.round(value * 100) / 100;

// Same rounding as the backend's computeComposedTotals
export const computeTotals = (data: BuilderData) => {
  const subtotal = cents(data.lineItems.reduce((sum, line) => sum + cents(line.quantity * line.unitPrice), 0));
  const taxAmount = cents((subtotal * data.taxRate) / 100);
  return { subtotal, taxAmount, totalAmount: cents(subtotal + taxAmount) };
};
