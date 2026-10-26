import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "my-ui/ui/button";
import { Calendar } from "my-ui/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "my-ui/ui/popover";
import { cn } from "my-ui/lib/utils";
import { MyUiField, type MyUiFieldProps } from "./my-ui-field";

type MyUiDatePickerProps = Pick<MyUiFieldProps, "label" | "description" | "error"> & {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  // date-fns pattern for the button text
  dateFormat?: string;
  disabled?: boolean;
  className?: string;
};

export function MyUiDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  dateFormat = "PPP",
  disabled,
  label,
  description,
  error,
  className,
}: MyUiDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const buttonId = React.useId();
  return (
    <MyUiField label={label} description={description} error={error} htmlFor={buttonId} className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={buttonId}
            variant="outline"
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            className={cn("w-full justify-start font-normal", !value && "text-muted-foreground")}
          >
            <CalendarIcon />
            {value ? format(value, dateFormat) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </MyUiField>
  );
}
