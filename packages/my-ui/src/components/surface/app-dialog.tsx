import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "my-ui/ui/dialog";
import { cn } from "my-ui/lib/utils";

type AppDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

// shadcn Dialog with the project layout: titled header bar, unpadded body (pass `sm:max-w-*` to size it)
export const AppDialog = ({ open, onClose, title, children, className }: AppDialogProps) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogContent
      aria-describedby={undefined}
      className={cn("flex max-h-[90vh] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-3xl", className)}
    >
      <DialogHeader className="border-b border-border px-4 py-3 pr-12">
        <DialogTitle className="truncate text-sm font-semibold">{title}</DialogTitle>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);
