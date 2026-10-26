import * as React from "react";
import { Badge } from "my-ui/ui/badge";

type MyUiBadgeProps = React.ComponentProps<typeof Badge> & { icon?: React.ReactNode };

export function MyUiBadge({ icon, children, ...props }: MyUiBadgeProps) {
  return (
    <Badge {...props}>
      {icon}
      {children}
    </Badge>
  );
}
