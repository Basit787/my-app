import * as React from "react";
import { PasswordInput } from "./password-input";
import { MyUiField, type MyUiFieldProps } from "./my-ui-field";

type MyUiPasswordInputProps = React.ComponentProps<typeof PasswordInput> &
  Pick<MyUiFieldProps, "label" | "description" | "error">;

export function MyUiPasswordInput({ label, description, error, id, className, ...props }: MyUiPasswordInputProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <MyUiField label={label} description={description} error={error} htmlFor={inputId} className={className}>
      <PasswordInput id={inputId} aria-invalid={error ? true : undefined} {...props} />
    </MyUiField>
  );
}
