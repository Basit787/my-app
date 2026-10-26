import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "my-ui/ui/select";
import { cn } from "my-ui/lib/utils";
import { MyUiField, type MyUiFieldProps } from "./my-ui-field";
import type { MyUiOption } from "./my-ui-option";

type MyUiSelectProps = Omit<React.ComponentProps<typeof Select>, "children"> &
  Pick<MyUiFieldProps, "label" | "description" | "error"> & {
    options: MyUiOption[];
    placeholder?: string;
    id?: string;
    className?: string;
  };

export function MyUiSelect({
  options,
  placeholder,
  label,
  description,
  error,
  id,
  className,
  ...props
}: MyUiSelectProps) {
  const autoId = React.useId();
  const triggerId = id ?? autoId;
  return (
    <MyUiField label={label} description={description} error={error} htmlFor={triggerId} className={className}>
      <Select {...props}>
        <SelectTrigger id={triggerId} aria-invalid={error ? true : undefined} className={cn("w-full")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.icon}
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </MyUiField>
  );
}
