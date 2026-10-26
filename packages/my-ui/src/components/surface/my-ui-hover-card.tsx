import type { ReactNode } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "my-ui/ui/hover-card";

type MyUiHoverCardProps = {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  openDelay?: number;
  className?: string;
};

export function MyUiHoverCard({ content, children, side, align, openDelay, className }: MyUiHoverCardProps) {
  return (
    <HoverCard openDelay={openDelay}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side={side} align={align} className={className}>
        {content}
      </HoverCardContent>
    </HoverCard>
  );
}
