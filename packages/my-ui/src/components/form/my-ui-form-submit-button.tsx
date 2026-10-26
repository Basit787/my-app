import type { ComponentProps } from "react";
import { MyUiButton } from "../button/my-ui-button";
import { useFormContext } from "./form-context";

type MyUiFormSubmitButtonProps = Omit<ComponentProps<typeof MyUiButton>, "type">;

// Submit button: disabled until something changed and while the form is invalid or submitting
export function MyUiFormSubmitButton({ disabled, loading, ...props }: MyUiFormSubmitButtonProps) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine] as const}>
      {([canSubmit, isSubmitting, isPristine]) => (
        <MyUiButton
          {...props}
          type="submit"
          loading={loading || isSubmitting}
          disabled={disabled || !canSubmit || isPristine}
        />
      )}
    </form.Subscribe>
  );
}
