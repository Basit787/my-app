import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Round checkbox beside a message while selecting several
export const SelectionCheckbox = ({ checked, onToggle }: { checked: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    className={cn(
      "mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
      checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50 bg-background",
    )}
    aria-label={checked ? "Deselect message" : "Select message"}
    aria-pressed={checked}
  >
    {checked && <Check className="h-3 w-3" strokeWidth={3} />}
  </button>
);
