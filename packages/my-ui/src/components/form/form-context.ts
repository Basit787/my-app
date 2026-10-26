import { createFormHookContexts } from "@tanstack/react-form";

// Shared by useAppForm and every field/form component, so they all read the same contexts
export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();
