import * as React from "react";
import { Field, FieldContent, FieldDescription, FieldLabel } from "my-ui/ui/field";
import { RadioGroup, RadioGroupItem } from "my-ui/ui/radio-group";
import { MyUiField, type MyUiFieldProps } from "./my-ui-field";
import type { MyUiOption } from "./my-ui-option";

type MyUiRadioGroupProps = Omit<React.ComponentProps<typeof RadioGroup>, "children"> &
  Pick<MyUiFieldProps, "label" | "description" | "error"> & { options: MyUiOption[] };

export function MyUiRadioGroup({ options, label, description, error, className, ...props }: MyUiRadioGroupProps) {
  const groupId = React.useId();
  return (
    <MyUiField label={label} description={description} error={error} className={className}>
      <RadioGroup {...props}>
        {options.map((option) => {
          const itemId = `${groupId}-${option.value}`;
          return (
            <Field key={option.value} orientation="horizontal">
              <RadioGroupItem id={itemId} value={option.value} disabled={option.disabled} />
              <FieldContent>
                <FieldLabel htmlFor={itemId}>{option.label}</FieldLabel>
                {option.description && <FieldDescription>{option.description}</FieldDescription>}
              </FieldContent>
            </Field>
          );
        })}
      </RadioGroup>
    </MyUiField>
  );
}
