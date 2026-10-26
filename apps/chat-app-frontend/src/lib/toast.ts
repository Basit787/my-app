import { toast } from "sonner";
import { getErrorMessage } from "frontend-common";

export const toastSuccess = (message: string) => {
  toast.success(message);
};

export const toastError = (error: unknown, fallback: string) => {
  toast.error(getErrorMessage(error, fallback));
};

const DEFAULT_UNDO_MS = 5000;

export const toastWithUndo = (
  message: string,
  {
    onUndo,
    onCommit,
    durationMs = DEFAULT_UNDO_MS,
  }: {
    onUndo: () => void;
    onCommit?: () => void | Promise<void>;
    durationMs?: number;
  },
) => {
  let undone = false;
  let committed = false;

  const commit = () => {
    if (undone || committed) return;
    committed = true;
    void onCommit?.();
  };

  const undo = () => {
    if (committed) return;
    undone = true;
    clearTimeout(timer);
    onUndo();
  };

  const timer = setTimeout(commit, durationMs);

  toast(message, {
    duration: durationMs,
    action: {
      label: "Undo",
      onClick: undo,
    },
    onDismiss: commit,
  });
};
