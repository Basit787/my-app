import type { ReactNode } from "react";
import { Separator } from "my-ui/ui/separator";
import { cn } from "my-ui/lib/utils";

type MyUiSeparatorProps = { label?: ReactNode; orientation?: "horizontal" | "vertical"; className?: string };

// Divider, optionally with centred text such as "or"
export function MyUiSeparator({ label, orientation, className }: MyUiSeparatorProps) {
  if (!label) return <Separator orientation={orientation} className={className} />;
  return (
    <div className={cn("flex items-center gap-3 text-xs text-muted-foreground", className)}>
      <Separator className="flex-1" />
      <span>{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}
