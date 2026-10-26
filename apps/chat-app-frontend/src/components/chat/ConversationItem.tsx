import { formatConversationTime } from "frontend-common";
import { useUserProfileImage } from "@/lib/use-user-profile-image";
import { cn } from "@/lib/utils";
import { Button } from "my-ui";
import { UserAvatar } from "@/components/avatar/user-avatar";
import type { Conversation } from "@/features/chat/store/chat-store";

type ConversationItemProps = {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
};

export const ConversationItem = ({ conversation, active, onClick, icon }: ConversationItemProps) => {
  const unread = conversation.unreadCount ?? 0;
  const hasUnread = unread > 0;
  const profileImage = useUserProfileImage(conversation.name);

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "relative h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-left font-normal",
        active ? "bg-accent text-accent-foreground hover:bg-accent" : "hover:bg-accent/50",
      )}
    >
      {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary" />}
      <div className="relative shrink-0">
        {icon ?? (
          <UserAvatar
            name={conversation.name}
            imageUrl={conversation.type === "dm" ? profileImage : undefined}
            showOnline={conversation.type === "dm"}
            status={conversation.presenceStatus}
          />
        )}
        {hasUnread && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("truncate text-sm font-medium", hasUnread && "font-semibold text-foreground")}>
            {conversation.type === "channel" ? `# ${conversation.name}` : conversation.name}
          </span>
          {conversation.lastAt && (
            <span
              className={cn("shrink-0 text-[11px]", hasUnread ? "font-medium text-primary" : "text-muted-foreground")}
            >
              {formatConversationTime(conversation.lastAt)}
            </span>
          )}
        </div>
        {conversation.lastMessage && (
          <p className={cn("truncate text-xs", hasUnread ? "font-medium text-foreground" : "text-muted-foreground")}>
            {conversation.lastMessage}
          </p>
        )}
      </div>
    </Button>
  );
};
