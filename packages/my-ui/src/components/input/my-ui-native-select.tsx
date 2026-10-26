import * as React from "react";
import { NativeSelect, NativeSelectOption } from "my-ui/ui/native-select";
import { MyUiField, type MyUiFieldProps } from "./my-ui-field";

type MyUiNativeSelectProps = Omit<React.ComponentProps<typeof NativeSelect>, "children"> &
  Pick<MyUiFieldProps, "label" | "description" | "error"> & {
    options: { value: string; label: string; disabled?: boolean }[];
    placeholder?: string;
  };

export function MyUiNativeSelect({
  options,
  placeholder,
  label,
  description,
  error,
  id,
  className,
  ...props
}: MyUiNativeSelectProps) {
  const autoId = React.useId();
  const selectId = id ?? autoId;
  return (
    <MyUiField label={label} description={description} error={error} htmlFor={selectId} className={className}>
      <NativeSelect id={selectId} aria-invalid={error ? true : undefined} {...props}>
        {placeholder && <NativeSelectOption value="">{placeholder}</NativeSelectOption>}
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </MyUiField>
  );
}
