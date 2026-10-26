import type { ReactNode } from "react";
import { Spinner } from "my-ui/ui/spinner";
import { cn } from "my-ui/lib/utils";

type MyUiSpinnerProps = { label?: ReactNode; className?: string };

export function MyUiSpinner({ label, className }: MyUiSpinnerProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Spinner />
      {label}
    </span>
  );
}
