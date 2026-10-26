import type { ComponentProps } from "react";
import { MyUiTextarea } from "../input/my-ui-textarea";
import { fieldError } from "./field-error";
import { useFieldContext } from "./form-context";

type MyUiFormTextareaFieldProps = Omit<
  ComponentProps<typeof MyUiTextarea>,
  "name" | "value" | "onChange" | "onBlur" | "error"
>;

// Textarea bound to the surrounding form.AppField
export function MyUiFormTextareaField(props: MyUiFormTextareaFieldProps) {
  const field = useFieldContext<string>();
  return (
    <MyUiTextarea
      {...props}
      name={field.name}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={fieldError(field.state.meta)}
    />
  );
}
