import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "my-ui/ui/alert";

type MyUiAlertProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "destructive";
  className?: string;
};

export function MyUiAlert({ title, description, icon, variant, className }: MyUiAlertProps) {
  return (
    <Alert variant={variant} className={className}>
      {icon}
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}
