import type { ReactNode } from "react";
import { FieldError } from "my-ui/ui/field";
import { MyUiCheckbox } from "../input/my-ui-checkbox";
import { fieldError } from "./field-error";
import { useFieldContext } from "./form-context";

type MyUiFormCheckboxFieldProps = { label?: ReactNode; description?: ReactNode; className?: string };

// Checkbox bound to a boolean form.AppField
export function MyUiFormCheckboxField({ label, description, className }: MyUiFormCheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  const error = fieldError(field.state.meta);
  return (
    <div className={className}>
      <MyUiCheckbox
        name={field.name}
        label={label}
        description={description}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
        onBlur={field.handleBlur}
        aria-invalid={error ? true : undefined}
      />
      {error && <FieldError className="mt-1">{error}</FieldError>}
    </div>
  );
}
