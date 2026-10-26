import type { ReactNode } from "react";
import { Marker, MarkerContent, MarkerIcon } from "my-ui/ui/marker";

type MyUiMarkerProps = {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "separator";
  className?: string;
};

// Inline status line in a conversation, e.g. "Today" or "Alex joined"
export function MyUiMarker({ children, icon, variant, className }: MyUiMarkerProps) {
  return (
    <Marker variant={variant} className={className}>
      {icon && <MarkerIcon>{icon}</MarkerIcon>}
      <MarkerContent>{children}</MarkerContent>
    </Marker>
  );
}
