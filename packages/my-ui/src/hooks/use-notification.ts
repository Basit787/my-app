import { useMemo, type ReactNode } from "react";
import { toast, type ExternalToast } from "sonner";

type ToastId = string | number;

export type NotificationApi = {
  showSuccessNotification: (message: ReactNode, options?: ExternalToast) => ToastId;
  showErrorNotification: (error: unknown, fallback?: string, options?: ExternalToast) => ToastId;
  showWarningNotification: (message: ReactNode, options?: ExternalToast) => ToastId;
  showInfoNotification: (message: ReactNode, options?: ExternalToast) => ToastId;
  showLoadingNotification: (message: ReactNode, options?: ExternalToast) => ToastId;
  // Loading toast that turns into success or error when the promise settles
  showPromiseNotification: <T>(
    promise: Promise<T>,
    messages: {
      loading: ReactNode;
      success: ReactNode | ((data: T) => ReactNode);
      error?: ReactNode | ((error: unknown) => ReactNode);
    },
  ) => void;
  dismissNotification: (id?: ToastId) => void;
};

// Text for an error toast: a string, an Error, an `{ message }` object, or the fallback
const errorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string" && error.trim()) return error;
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message || fallback;
  }
  return fallback;
};

// Toast helpers (sonner) for success, error, warning, info, loading and promise notifications
export function useNotification(): NotificationApi {
  return useMemo<NotificationApi>(
    () => ({
      showSuccessNotification: (message, options) => toast.success(message, options),
      showErrorNotification: (error, fallback = "Something went wrong", options) =>
        toast.error(errorMessage(error, fallback), options),
      showWarningNotification: (message, options) => toast.warning(message, options),
      showInfoNotification: (message, options) => toast.info(message, options),
      showLoadingNotification: (message, options) => toast.loading(message, options),
      showPromiseNotification: (promise, messages) => {
        toast.promise(promise, {
          ...messages,
          error: messages.error ?? ((error: unknown) => errorMessage(error, "Something went wrong")),
        });
      },
      dismissNotification: (id) => {
        toast.dismiss(id);
      },
    }),
    [],
  );
}
