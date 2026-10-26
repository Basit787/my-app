import * as React from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "my-ui/ui/input-group";
import { MyUiField, type MyUiFieldProps } from "./my-ui-field";

type MyUiInputGroupProps = React.ComponentProps<typeof InputGroupInput> &
  Pick<MyUiFieldProps, "label" | "description" | "error"> & {
    // Icon, text or button shown before / after the input
    start?: React.ReactNode;
    end?: React.ReactNode;
  };

export function MyUiInputGroup({
  start,
  end,
  label,
  description,
  error,
  id,
  className,
  ...props
}: MyUiInputGroupProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <MyUiField label={label} description={description} error={error} htmlFor={inputId} className={className}>
      <InputGroup>
        <InputGroupInput id={inputId} aria-invalid={error ? true : undefined} {...props} />
        {start && <InputGroupAddon>{start}</InputGroupAddon>}
        {end && <InputGroupAddon align="inline-end">{end}</InputGroupAddon>}
      </InputGroup>
    </MyUiField>
  );
}
