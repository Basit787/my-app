import { X } from "lucide-react";
import { Button, AppDialog } from "my-ui";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { buildConversations } from "@/features/chat/store/chat-store";
import { useChatStore } from "@/features/chat/store/chat-store";
import { useAuthStore } from "@/lib/auth-store";
import type { ChatMessage } from "@/features/chat/api/api";
import { conversationToRoom } from "@/lib/rooms";
import { formatForwardText } from "@/lib/messages";
import { toastSuccess } from "@/lib/toast";

import type { Socket } from "socket.io-client";

type ForwardDialogProps = {
  open: boolean;
  messages: ChatMessage[];
  socket: Socket | null;
  onClose: () => void;
};

export const ForwardDialog = ({ open, messages, socket, onClose }: ForwardDialogProps) => {
  const username = useAuthStore((s) => s.username);
  const allMessages = useChatStore((s) => s.messages);
  const groups = useChatStore((s) => s.groups);
  const callHistory = useChatStore((s) => s.callHistory);
  const knownContacts = useChatStore((s) => s.knownContacts);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const userStatuses = useChatStore((s) => s.userStatuses);
  const setForwardMessage = useChatStore((s) => s.setForwardMessage);

  const sourceRooms = new Set(messages.map((m) => m.room));
  const conversations = buildConversations(
    allMessages,
    onlineUsers,
    username,
    groups,
    callHistory,
    knownContacts,
    userStatuses,
  ).filter((c) => !sourceRooms.has(conversationToRoom(c.id, username)));

  const hasFile = messages.some((m) => m.type === "file");
  const title = messages.length > 1 ? `Forward ${messages.length} messages` : "Forward message";

  const handleForward = (conversationId: string) => {
    if (messages.length === 0 || !socket) return;
    const room = conversationToRoom(conversationId, username);
    const label = conversationId === "general" ? "General" : conversationId;

    if (messages.length === 1 && messages[0].type === "file") {
      setForwardMessage(messages[0]);
      onClose();
      return;
    }

    for (const message of messages) {
      if (message.type === "file") {
        setForwardMessage(message);
        continue;
      }
      socket.emit("message", { room, text: formatForwardText(message) });
    }

    toastSuccess(messages.length > 1 ? `Forwarded ${messages.length} messages to ${label}` : `Forwarded to ${label}`);
    onClose();
  };

  if (!open || messages.length === 0) return null;

  return (
    <AppDialog open={open} onClose={onClose} title={title} className="sm:max-w-sm">
      <div className="max-h-72 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">No other conversations</p>
        ) : (
          conversations.map((conversation) => (
            <Button
              key={conversation.id}
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 font-normal"
              onClick={() => handleForward(conversation.id)}
            >
              <UserAvatar name={conversation.name} className="h-9 w-9" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{conversation.name}</p>
                {conversation.lastMessage && (
                  <p className="truncate text-xs text-muted-foreground">{conversation.lastMessage}</p>
                )}
              </div>
            </Button>
          ))
        )}
      </div>
      {hasFile && (
        <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Text messages will be forwarded. File attachments must be re-uploaded from the original chat.
        </p>
      )}
      <div className="border-t border-border p-2">
        <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </AppDialog>
  );
};
