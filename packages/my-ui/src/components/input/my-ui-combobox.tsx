import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "my-ui/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "my-ui/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "my-ui/ui/popover";
import { cn } from "my-ui/lib/utils";
import { MyUiField, type MyUiFieldProps } from "./my-ui-field";
import type { MyUiOption } from "./my-ui-option";

type MyUiComboboxProps = Pick<MyUiFieldProps, "label" | "description" | "error"> & {
  options: (MyUiOption & { label: string })[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
};

// Searchable select (Popover + Command)
export function MyUiCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "Nothing found.",
  disabled,
  label,
  description,
  error,
  className,
}: MyUiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const buttonId = React.useId();
  const selected = options.find((option) => option.value === value);
  return (
    <MyUiField label={label} description={description} error={error} htmlFor={buttonId} className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={buttonId}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            className={cn("w-full justify-between font-normal", !selected && "text-muted-foreground")}
          >
            {selected?.label ?? placeholder}
            <ChevronsUpDownIcon className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    disabled={option.disabled}
                    onSelect={() => {
                      onValueChange?.(option.value === value ? "" : option.value);
                      setOpen(false);
                    }}
                  >
                    {option.icon}
                    {option.label}
                    <CheckIcon className={cn("ml-auto", option.value === value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </MyUiField>
  );
}
