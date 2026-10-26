import * as React from "react";
import { Toggle } from "my-ui/ui/toggle";

type MyUiToggleProps = React.ComponentProps<typeof Toggle> & { icon?: React.ReactNode; label?: React.ReactNode };

export function MyUiToggle({ icon, label, children, ...props }: MyUiToggleProps) {
  return (
    <Toggle {...props}>
      {icon}
      {label}
      {children}
    </Toggle>
  );
}
