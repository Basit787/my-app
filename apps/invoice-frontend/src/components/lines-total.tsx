import { CircleAlert, CircleCheck } from "lucide-react";
import type { LineItemFormValues } from "@/features/invoices/types/line-item-form-values";
import { sumLineAmounts } from "@/features/invoices/utils/sum-line-amounts";
import { cn } from "@/lib/utils";

type LinesTotalProps = { lines: LineItemFormValues[]; subtotal: string };

// The lines' sum next to the subtotal, so a misread amount stands out
export const LinesTotal = ({ lines, subtotal }: LinesTotalProps) => {
  if (!lines.length) return null;
  const total = sumLineAmounts(lines);
  const subtotalNumber = Number(subtotal);
  const hasSubtotal = subtotal.trim() !== "" && Number.isFinite(subtotalNumber);
  const matches = hasSubtotal && Math.abs(total - subtotalNumber) < 0.005;

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs",
        hasSubtotal && !matches ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
      )}
    >
      {hasSubtotal && (matches ? <CircleCheck className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />)}
      Lines total {total.toFixed(2)}
      {hasSubtotal && (matches ? " = subtotal" : ` ≠ subtotal ${subtotalNumber.toFixed(2)}`)}
    </span>
  );
};
