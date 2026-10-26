import type { ComponentProps } from "react";
import { useFormContext } from "./form-context";

type MyUiFormProps = Omit<ComponentProps<"form">, "onSubmit" | "noValidate">;

// <form> that submits through the surrounding form.AppForm (validators run first)
export function MyUiForm(props: MyUiFormProps) {
  const form = useFormContext();
  return (
    <form
      {...props}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    />
  );
}
