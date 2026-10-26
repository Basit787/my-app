import * as React from "react";
import { Input } from "my-ui/ui/input";
import { MyUiField, type MyUiFieldProps } from "./my-ui-field";

type MyUiInputProps = React.ComponentProps<typeof Input> & Pick<MyUiFieldProps, "label" | "description" | "error">;

export function MyUiInput({ label, description, error, id, className, ...props }: MyUiInputProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <MyUiField label={label} description={description} error={error} htmlFor={inputId} className={className}>
      <Input id={inputId} aria-invalid={error ? true : undefined} {...props} />
    </MyUiField>
  );
}
