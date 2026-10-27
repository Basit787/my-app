import type { LineItemFormValues } from "../types/line-item-form-values";

// Sum of the lines' amounts in cents-safe steps; empty or invalid amounts count as 0
export const sumLineAmounts = (lines: LineItemFormValues[]): number => {
  const cents = lines.reduce((total, line) => {
    const amount = Number(line.amount);
    return line.amount.trim() && Number.isFinite(amount) ? total + Math.round(amount * 100) : total;
  }, 0);
  return cents / 100;
};
