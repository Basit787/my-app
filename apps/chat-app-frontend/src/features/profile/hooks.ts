import { useCallback } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { updatePresenceStatus, type PresenceStatus } from "@/features/profile/api";
import { useAuthStore } from "@/lib/auth-store";
import { useChatStore, type UserStatus } from "@/features/chat/store/chat-store";
import { useMutationToast } from "@/lib/use-mutation-toast";

export const useUpdatePresenceStatus = (): UseMutationResult<PresenceStatus, Error, UserStatus> => {
  const username = useAuthStore((s) => s.username);
  const mergeUserStatuses = useChatStore((s) => s.mergeUserStatuses);
  const setUserStatus = useChatStore((s) => s.setUserStatus);
  const { onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: (status: UserStatus) => updatePresenceStatus(status),
    onMutate: (status) => {
      mergeUserStatuses({ [username]: status });
      setUserStatus(status);
    },
    onError: (err) => onErrorNotification(err, "Could not update status"),
  });
};

export const usePresenceStatus = () => {
  const username = useAuthStore((s) => s.username);
  const userStatuses = useChatStore((s) => s.userStatuses);
  const userStatus = useChatStore((s) => s.userStatuses[username] ?? s.userStatus);
  const updateStatus = useUpdatePresenceStatus();

  const changeStatus = useCallback(
    (status: UserStatus) => {
      updateStatus.mutate(status);
    },
    [updateStatus],
  );

  return { userStatus, userStatuses, changeStatus, isUpdating: updateStatus.isPending };
};
