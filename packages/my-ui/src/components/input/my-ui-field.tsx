import type { ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "my-ui/ui/field";

export type MyUiFieldProps = {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  htmlFor?: string;
  orientation?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
};

// Label, control, description and error laid out the shadcn way
export function MyUiField({ label, description, error, htmlFor, orientation, className, children }: MyUiFieldProps) {
  return (
    <Field orientation={orientation} data-invalid={error ? true : undefined} className={className}>
      {label && <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>}
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
