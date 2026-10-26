import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./form-context";
import { MyUiForm } from "./my-ui-form";
import { MyUiFormCheckboxField } from "./my-ui-form-checkbox-field";
import { MyUiFormPasswordField } from "./my-ui-form-password-field";
import { MyUiFormSubmitButton } from "./my-ui-form-submit-button";
import { MyUiFormTextareaField } from "./my-ui-form-textarea-field";
import { MyUiFormTextField } from "./my-ui-form-text-field";

// The app-wide TanStack Form hook: form.AppField gives field.TextField…, form.AppForm gives form.Form / SubmitButton
export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField: MyUiFormTextField,
    PasswordField: MyUiFormPasswordField,
    TextareaField: MyUiFormTextareaField,
    CheckboxField: MyUiFormCheckboxField,
  },
  formComponents: {
    Form: MyUiForm,
    SubmitButton: MyUiFormSubmitButton,
  },
});
