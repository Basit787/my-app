import { useMemo } from "react";
import { AppDialog, Button } from "my-ui";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { buildConversations, useChatStore } from "@/features/chat/store/chat-store";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

type NewDirectMessageDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const NewDirectMessageDialog = ({ open, onClose }: NewDirectMessageDialogProps) => {
  const username = useAuthStore((s) => s.username);
  const messages = useChatStore((s) => s.messages);
  const groups = useChatStore((s) => s.groups);
  const callHistory = useChatStore((s) => s.callHistory);
  const knownContacts = useChatStore((s) => s.knownContacts);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const userStatuses = useChatStore((s) => s.userStatuses);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);

  const candidates = useMemo(() => {
    const fromConversations = buildConversations(
      messages,
      onlineUsers,
      username,
      groups,
      callHistory,
      knownContacts,
      userStatuses,
    )
      .filter((c) => c.type === "dm")
      .map((c) => c.name);

    return [...new Set(fromConversations)].sort((a, b) => a.localeCompare(b));
  }, [messages, onlineUsers, username, groups, callHistory, knownContacts, userStatuses]);

  const startChat = (peer: string) => {
    setActiveConversation(peer);
    onClose();
  };

  return (
    <AppDialog open={open} onClose={onClose} title="New message" className="sm:max-w-sm">
      <div className="max-h-72 overflow-y-auto p-2">
        {candidates.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">No contacts available</p>
        ) : (
          candidates.map((member) => {
            const online = onlineUsers.includes(member);
            return (
              <Button
                key={member}
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 font-normal"
                onClick={() => startChat(member)}
              >
                <UserAvatar name={member} showOnline online={online} className="h-9 w-9" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{member}</p>
                  <p className={cn("text-xs", online ? "text-online" : "text-muted-foreground")}>
                    {online ? "Online" : "Offline"}
                  </p>
                </div>
              </Button>
            );
          })
        )}
      </div>
    </AppDialog>
  );
};
