import * as React from "react";
import { Slider } from "my-ui/ui/slider";
import { MyUiField, type MyUiFieldProps } from "./my-ui-field";

type MyUiSliderProps = React.ComponentProps<typeof Slider> &
  Pick<MyUiFieldProps, "label" | "description"> & { showValue?: boolean };

export function MyUiSlider({ label, description, showValue, className, ...props }: MyUiSliderProps) {
  const current = props.value ?? props.defaultValue ?? [];
  return (
    <MyUiField
      label={
        label && (
          <span className="flex w-full justify-between">
            {label}
            {showValue && <span className="text-muted-foreground">{current.join(" – ")}</span>}
          </span>
        )
      }
      description={description}
      className={className}
    >
      <Slider {...props} />
    </MyUiField>
  );
}
