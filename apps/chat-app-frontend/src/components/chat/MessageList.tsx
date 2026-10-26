import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CallHistoryItem } from "@/components/call/CallHistoryItem";
import { DateSeparator } from "@/components/chat/DateSeparator";
import { ForwardDialog } from "@/components/chat/ForwardDialog";
import { MessageActionMenu, type MessageAction } from "@/components/chat/MessageActionMenu";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { buildTimeline } from "@/lib/build-timeline";
import { messageKey } from "@/lib/messages";
import { downloadFileAsAttachment } from "@/lib/useFileBlob";
import { useSingleMessageActions } from "@/lib/use-message-bulk-actions";
import type { ChatMessage } from "@/features/chat/api/api";
import { useChatStore } from "@/features/chat/store/chat-store";
import { toastError, toastSuccess } from "@/lib/toast";
import { useChatRoom } from "@/features/chat/context/use-chat-room";
import { resolveDeliveryStatus } from "@/lib/message-receipts";

// The open conversation: messages and calls by day, plus the message menu and forward dialog
export const MessageList = () => {
  const { visibleMessages, visibleCalls, username: selfUsername, socket, actions } = useChatRoom();
  const messages = visibleMessages;
  const calls = visibleCalls;
  const messageStatus = useChatStore((s) => s.messageStatus);
  const messageSelectionMode = useChatStore((s) => s.messageSelectionMode);
  const selectedMessageKeys = useChatStore((s) => s.selectedMessageKeys);
  const toggleMessageKey = useChatStore((s) => s.toggleMessageKey);
  const exitMessageSelection = useChatStore((s) => s.exitMessageSelection);
  const forwardBatch = useChatStore((s) => s.forwardBatch);
  const setForwardBatch = useChatStore((s) => s.setForwardBatch);

  const { runAction } = useSingleMessageActions();

  const [menu, setMenu] = useState<{ message: ChatMessage; x: number; y: number } | null>(null);
  const [forwardOpen, setForwardOpen] = useState(false);

  const timeline = buildTimeline(messages, calls);

  useEffect(() => {
    if (forwardBatch.length === 0) return;
    setForwardOpen(true);
  }, [forwardBatch]);

  useEffect(() => {
    if (!messageSelectionMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitMessageSelection();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [exitMessageSelection, messageSelectionMode]);

  const handleAction = async (action: MessageAction, message: ChatMessage) => {
    if (action === "download") {
      if (!message.file) return;
      try {
        await downloadFileAsAttachment(message.room, message.file.id, message.file.name);
        toastSuccess("Download started");
      } catch (error) {
        toastError(error, "Could not download file");
      }
      return;
    }
    await runAction(action, message, (batch) => setForwardBatch(batch));
  };

  if (timeline.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        No messages yet. Say hello!
      </div>
    );
  }

  let lastDate = "";
  let lastUser = "";

  return (
    <>
      <div className="space-y-3 px-3 py-4 sm:px-5">
        {timeline.map((item) => {
          const dateKey = format(new Date(item.at), "yyyy-MM-dd");
          const showDate = dateKey !== lastDate;
          lastDate = dateKey;

          if (item.kind === "call") {
            return (
              <div key={`call-${item.call.id}`}>
                {showDate && <DateSeparator date={item.at} />}
                <CallHistoryItem call={item.call} selfUsername={selfUsername} compact />
              </div>
            );
          }

          const message = item.message;
          const isOwn = message.user === selfUsername;
          const showAvatar = !isOwn && message.user !== lastUser;
          lastUser = message.user;
          const key = messageKey(message);
          const isChecked = selectedMessageKeys.includes(key);

          return (
            <div key={key}>
              {showDate && <DateSeparator date={message.at} />}
              <MessageBubble
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                highlighted={menu?.message ? messageKey(menu.message) === key : false}
                selectionMode={messageSelectionMode && !message.deleted}
                isChecked={isChecked}
                deliveryStatus={resolveDeliveryStatus(message, message.id ? messageStatus[message.id] : undefined)}
                onOpenMenu={(x, y) => !message.deleted && setMenu({ message, x, y })}
                onToggleSelect={() => !message.deleted && toggleMessageKey(key)}
                onOpenProfile={() => actions.openContactInfo(message.user)}
              />
            </div>
          );
        })}
      </div>

      <MessageActionMenu
        open={!!menu}
        x={menu?.x ?? 0}
        y={menu?.y ?? 0}
        isOwn={menu?.message.user === selfUsername}
        canDeleteForAll={!!menu?.message.id && !menu?.message.deleted}
        canCopy
        canDownload={!!menu?.message.file && !menu?.message.deleted}
        onAction={(action) => menu && void handleAction(action, menu.message)}
        onClose={() => setMenu(null)}
      />

      <ForwardDialog
        open={forwardOpen}
        messages={forwardBatch}
        socket={socket}
        onClose={() => {
          setForwardOpen(false);
          setForwardBatch([]);
          exitMessageSelection();
        }}
      />
    </>
  );
};
