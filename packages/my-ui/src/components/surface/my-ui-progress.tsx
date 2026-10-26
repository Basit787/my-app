import type { ReactNode } from "react";
import { Progress } from "my-ui/ui/progress";

type MyUiProgressProps = { value: number; label?: ReactNode; showValue?: boolean; className?: string };

export function MyUiProgress({ value, label, showValue, className }: MyUiProgressProps) {
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex justify-between text-sm">
          <span>{label}</span>
          {showValue && <span className="text-muted-foreground">{Math.round(value)}%</span>}
        </div>
      )}
      <Progress value={value} />
    </div>
  );
}
