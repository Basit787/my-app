import type { ComponentProps } from "react";
import { MyUiInput } from "../input/my-ui-input";
import { fieldError } from "./field-error";
import { useFieldContext } from "./form-context";

type MyUiFormTextFieldProps = Omit<
  ComponentProps<typeof MyUiInput>,
  "name" | "value" | "onChange" | "onBlur" | "error"
>;

// Text input bound to the surrounding form.AppField
export function MyUiFormTextField(props: MyUiFormTextFieldProps) {
  const field = useFieldContext<string>();
  return (
    <MyUiInput
      {...props}
      name={field.name}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={fieldError(field.state.meta)}
    />
  );
}
