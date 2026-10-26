import type { ReactNode } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "my-ui/ui/collapsible";

type MyUiCollapsibleProps = {
  // The element that toggles the content
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  className?: string;
};

export function MyUiCollapsible({
  trigger,
  children,
  open,
  onOpenChange,
  defaultOpen,
  className,
}: MyUiCollapsibleProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen} className={className}>
      <CollapsibleTrigger asChild>{trigger}</CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
