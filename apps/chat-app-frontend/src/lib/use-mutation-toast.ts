import { resolveMutationError } from "frontend-common";
import { toastSuccess } from "@/lib/toast";
import { toast } from "sonner";

export const useMutationToast = () => {
  return {
    onSuccessNotification: (message: string) => toastSuccess(message),
    onErrorNotification: (error: unknown, fallback: string) => {
      toast.error(resolveMutationError(error, fallback));
    },
  };
};
