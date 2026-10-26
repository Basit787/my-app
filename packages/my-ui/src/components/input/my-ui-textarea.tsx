import * as React from "react";
import { Textarea } from "my-ui/ui/textarea";
import { MyUiField, type MyUiFieldProps } from "./my-ui-field";

type MyUiTextareaProps = React.ComponentProps<typeof Textarea> &
  Pick<MyUiFieldProps, "label" | "description" | "error">;

export function MyUiTextarea({ label, description, error, id, className, ...props }: MyUiTextareaProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <MyUiField label={label} description={description} error={error} htmlFor={inputId} className={className}>
      <Textarea id={inputId} aria-invalid={error ? true : undefined} {...props} />
    </MyUiField>
  );
}
