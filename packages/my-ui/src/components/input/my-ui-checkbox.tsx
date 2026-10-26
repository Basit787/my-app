import * as React from "react";
import { Checkbox } from "my-ui/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldLabel } from "my-ui/ui/field";

type MyUiCheckboxProps = React.ComponentProps<typeof Checkbox> & {
  label?: React.ReactNode;
  description?: React.ReactNode;
};

export function MyUiCheckbox({ label, description, id, className, ...props }: MyUiCheckboxProps) {
  const autoId = React.useId();
  const checkboxId = id ?? autoId;
  return (
    <Field orientation="horizontal" className={className}>
      <Checkbox id={checkboxId} {...props} />
      {(label || description) && (
        <FieldContent>
          {label && <FieldLabel htmlFor={checkboxId}>{label}</FieldLabel>}
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
      )}
    </Field>
  );
}
