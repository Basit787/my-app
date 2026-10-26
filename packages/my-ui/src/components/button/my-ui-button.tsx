import * as React from "react";
import { Button } from "my-ui/ui/button";
import { Spinner } from "my-ui/ui/spinner";

type MyUiButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
};

// Button with optional icons and a loading spinner that also disables it
export function MyUiButton({ loading, icon, iconRight, disabled, children, ...props }: MyUiButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading ? <Spinner /> : icon}
      {children}
      {iconRight}
    </Button>
  );
}
