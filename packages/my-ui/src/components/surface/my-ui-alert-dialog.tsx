import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "my-ui/ui/alert-dialog";
import { buttonVariants } from "my-ui/ui/button";

type MyUiAlertDialogProps = {
  title: ReactNode;
  description?: ReactNode;
  // Icon shown above the title
  media?: ReactNode;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "default" | "sm";
};

// Confirmation dialog: "Are you sure?" with cancel / confirm
export function MyUiAlertDialog({
  title,
  description,
  media,
  confirmText = "Continue",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  destructive,
  trigger,
  open,
  onOpenChange,
  size,
}: MyUiAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent size={size}>
        <AlertDialogHeader>
          {media && <AlertDialogMedia>{media}</AlertDialogMedia>}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={destructive ? buttonVariants({ variant: "destructive" }) : undefined}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
