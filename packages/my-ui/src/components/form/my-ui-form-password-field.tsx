import type { ComponentProps } from "react";
import { MyUiPasswordInput } from "../input/my-ui-password-input";
import { fieldError } from "./field-error";
import { useFieldContext } from "./form-context";

type MyUiFormPasswordFieldProps = Omit<
  ComponentProps<typeof MyUiPasswordInput>,
  "name" | "value" | "onChange" | "onBlur" | "error"
>;

// Password input with show/hide, bound to the surrounding form.AppField
export function MyUiFormPasswordField(props: MyUiFormPasswordFieldProps) {
  const field = useFieldContext<string>();
  return (
    <MyUiPasswordInput
      {...props}
      name={field.name}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={fieldError(field.state.meta)}
    />
  );
}
