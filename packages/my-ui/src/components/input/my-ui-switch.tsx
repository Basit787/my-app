import * as React from "react";
import { Field, FieldContent, FieldDescription, FieldLabel } from "my-ui/ui/field";
import { Switch } from "my-ui/ui/switch";

type MyUiSwitchProps = React.ComponentProps<typeof Switch> & { label?: React.ReactNode; description?: React.ReactNode };

export function MyUiSwitch({ label, description, id, className, ...props }: MyUiSwitchProps) {
  const autoId = React.useId();
  const switchId = id ?? autoId;
  return (
    <Field orientation="horizontal" className={className}>
      {(label || description) && (
        <FieldContent>
          {label && <FieldLabel htmlFor={switchId}>{label}</FieldLabel>}
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
      )}
      <Switch id={switchId} {...props} />
    </Field>
  );
}
