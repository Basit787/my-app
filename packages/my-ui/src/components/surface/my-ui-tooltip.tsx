import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "my-ui/ui/tooltip";

type MyUiTooltipProps = {
  // What shows on hover / focus
  text: ReactNode;
  // The element that triggers the tooltip
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  disabled?: boolean;
};

export function MyUiTooltip({ text, children, side, align, delayDuration, disabled }: MyUiTooltipProps) {
  if (disabled || !text) return <>{children}</>;
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align}>
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
