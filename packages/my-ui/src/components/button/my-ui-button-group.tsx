import * as React from "react";
import { Button } from "my-ui/ui/button";
import { ButtonGroup } from "my-ui/ui/button-group";

type MyUiButtonGroupItem = {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

type MyUiButtonGroupProps = {
  items: MyUiButtonGroupItem[];
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export function MyUiButtonGroup({ items, variant = "outline", size, orientation, className }: MyUiButtonGroupProps) {
  return (
    <ButtonGroup orientation={orientation} className={className}>
      {items.map((item, index) => (
        <Button
          key={index}
          variant={variant}
          size={size}
          onClick={item.onClick}
          disabled={item.disabled}
          aria-label={item.ariaLabel}
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
