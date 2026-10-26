import { useCallback, useMemo } from "react";
import { deleteMessage, type ChatMessage } from "@/features/chat/api/api";
import { messageKey, messagePreview, messagesCopyText } from "@/lib/messages";
import { toastError, toastSuccess, toastWithUndo } from "@/lib/toast";
import { useChatStore } from "@/features/chat/store/chat-store";

export const useMessageBulkActions = (messages: ChatMessage[], selfUsername: string) => {
  const hideMessageForMe = useChatStore((s) => s.hideMessageForMe);
  const unhideMessageForMe = useChatStore((s) => s.unhideMessageForMe);
  const markMessageDeleted = useChatStore((s) => s.markMessageDeleted);
  const restoreMessage = useChatStore((s) => s.restoreMessage);
  const selectedMessageKeys = useChatStore((s) => s.selectedMessageKeys);
  const exitMessageSelection = useChatStore((s) => s.exitMessageSelection);

  const selectableMessages = useMemo(() => messages.filter((m) => !m.deleted), [messages]);

  const ownSelectableMessages = useMemo(
    () => selectableMessages.filter((m) => m.user === selfUsername),
    [selectableMessages, selfUsername],
  );

  const selectedMessages = useMemo(
    () => selectableMessages.filter((m) => selectedMessageKeys.includes(messageKey(m))),
    [selectableMessages, selectedMessageKeys],
  );

  const canDeleteAllSelected = useMemo(
    () => selectedMessages.length > 0 && selectedMessages.every((m) => m.user === selfUsername && !!m.id),
    [selectedMessages, selfUsername],
  );

  const runBulkAction = useCallback(
    async (action: "copy" | "forward" | "delete-me" | "delete-all", onForward: (messages: ChatMessage[]) => void) => {
      if (selectedMessages.length === 0) return;

      if (action === "copy") {
        try {
          await navigator.clipboard.writeText(messagesCopyText(selectedMessages));
          toastSuccess(`Copied ${selectedMessages.length} message${selectedMessages.length === 1 ? "" : "s"}`);
          exitMessageSelection();
        } catch {
          toastError(null, "Could not copy");
        }
        return;
      }

      if (action === "forward") {
        onForward([...selectedMessages]);
        return;
      }

      if (action === "delete-me") {
        const keys = selectedMessages.map((m) => messageKey(m));
        keys.forEach((key) => hideMessageForMe(key));
        toastWithUndo(`${selectedMessages.length} message${selectedMessages.length === 1 ? "" : "s"} deleted for you`, {
          onUndo: () => keys.forEach((key) => unhideMessageForMe(key)),
        });
        exitMessageSelection();
        return;
      }

      if (action === "delete-all") {
        const deletable = selectedMessages.filter((m) => m.user === selfUsername && m.id);
        if (deletable.length === 0) {
          toastError(null, "No messages can be deleted for everyone");
          return;
        }

        const snapshots = deletable.map((m) => ({ ...m, file: m.file ? { ...m.file } : undefined }));
        deletable.forEach((m) => markMessageDeleted({ ...m, deleted: true, text: "", file: undefined, type: "text" }));

        toastWithUndo(`${deletable.length} message${deletable.length === 1 ? "" : "s"} deleted for everyone`, {
          onUndo: () => snapshots.forEach((snapshot) => restoreMessage(snapshot)),
          onCommit: async () => {
            const failed: ChatMessage[] = [];
            for (const message of deletable) {
              try {
                await deleteMessage(message.room, message.id!);
              } catch {
                failed.push(message);
              }
            }
            if (failed.length > 0) {
              failed.forEach((snapshot) => restoreMessage(snapshot));
              toastError(null, `Could not delete ${failed.length} message${failed.length === 1 ? "" : "s"}`);
            }
          },
        });
        exitMessageSelection();
      }
    },
    [
      exitMessageSelection,
      hideMessageForMe,
      markMessageDeleted,
      restoreMessage,
      selectedMessages,
      selfUsername,
      unhideMessageForMe,
    ],
  );

  return {
    selectableMessages,
    ownSelectableMessages,
    selectedMessages,
    canDeleteAllSelected,
    runBulkAction,
  };
};

export const useSingleMessageActions = () => {
  const setReplyTo = useChatStore((s) => s.setReplyTo);
  const hideMessageForMe = useChatStore((s) => s.hideMessageForMe);
  const unhideMessageForMe = useChatStore((s) => s.unhideMessageForMe);
  const markMessageDeleted = useChatStore((s) => s.markMessageDeleted);
  const restoreMessage = useChatStore((s) => s.restoreMessage);
  const enterMessageSelection = useChatStore((s) => s.enterMessageSelection);

  const runAction = useCallback(
    async (action: string, message: ChatMessage, onForward: (messages: ChatMessage[]) => void) => {
      const key = messageKey(message);
      const copyText = messagePreview(message);

      if (action === "select") {
        enterMessageSelection(key);
        return;
      }
      if (action === "reply") {
        setReplyTo(message);
        return;
      }
      if (action === "copy") {
        try {
          await navigator.clipboard.writeText(copyText);
          toastSuccess("Copied");
        } catch {
          toastError(null, "Could not copy");
        }
        return;
      }
      if (action === "forward") {
        onForward([message]);
        return;
      }
      if (action === "delete-me") {
        hideMessageForMe(key);
        toastWithUndo("Message deleted for you", { onUndo: () => unhideMessageForMe(key) });
        return;
      }
      if (action === "delete-all") {
        if (!message.id) {
          toastError(null, "Cannot delete this message");
          return;
        }
        const snapshot: ChatMessage = { ...message, file: message.file ? { ...message.file } : undefined };
        markMessageDeleted({ ...message, deleted: true, text: "", file: undefined, type: "text" });
        toastWithUndo("Message deleted for everyone", {
          onUndo: () => restoreMessage(snapshot),
          onCommit: async () => {
            try {
              await deleteMessage(message.room, message.id!);
            } catch (error) {
              restoreMessage(snapshot);
              toastError(error, "Could not delete message");
            }
          },
        });
      }
    },
    [enterMessageSelection, hideMessageForMe, markMessageDeleted, restoreMessage, setReplyTo, unhideMessageForMe],
  );

  return { runAction };
};
