import { Bubble, BubbleContent, Message, MessageAvatar, MessageContent, MessageFooter } from "my-ui";
import { formatMessageTime } from "frontend-common";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { FileAttachment } from "@/components/chat/FileAttachment";
import { MessageMeta } from "@/components/chat/MessageMeta";
import { SelectionCheckbox } from "@/components/chat/SelectionCheckbox";
import { useLongPress } from "@/lib/use-long-press";
import { attachmentCaption, DELETED_MESSAGE_LABEL } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { useUserProfileImage } from "@/lib/use-user-profile-image";
import type { ChatMessage } from "@/features/chat/api/api";
import type { MessageDeliveryStatus } from "@/features/chat/store/chat-store";

type MessageBubbleProps = {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  highlighted: boolean;
  selectionMode: boolean;
  isChecked: boolean;
  deliveryStatus: MessageDeliveryStatus;
  onOpenMenu: (x: number, y: number) => void;
  onToggleSelect: () => void;
  onOpenProfile: () => void;
};

// One message: text, file or "deleted"; right-click or long-press opens its menu
export const MessageBubble = ({
  message,
  isOwn,
  showAvatar,
  highlighted,
  selectionMode,
  isChecked,
  deliveryStatus,
  onOpenMenu,
  onToggleSelect,
  onOpenProfile,
}: MessageBubbleProps) => {
  const isDeleted = !!message.deleted;
  const isFile = !isDeleted && message.type === "file" && message.file;
  const senderImage = useUserProfileImage(message.user);
  const longPress = useLongPress((x, y) => {
    if (selectionMode) onToggleSelect();
    else onOpenMenu(x, y);
  });

  const handleClick = () => {
    if (selectionMode && !isDeleted) onToggleSelect();
  };

  return (
    <div className="flex w-full items-start gap-2">
      {selectionMode && <SelectionCheckbox checked={isChecked} onToggle={onToggleSelect} />}

      <Message align={isOwn ? "end" : "start"} className="min-w-0 flex-1">
        {!isOwn &&
          !selectionMode &&
          (showAvatar ? (
            <MessageAvatar className="mt-1 size-8 self-start bg-transparent">
              <button
                type="button"
                onClick={onOpenProfile}
                className="size-8 rounded-full"
                aria-label={`View ${message.user}'s profile`}
              >
                <UserAvatar name={message.user} imageUrl={senderImage} className="h-8 w-8" />
              </button>
            </MessageAvatar>
          ) : (
            <div className="w-8 shrink-0" />
          ))}

        <MessageContent>
          <Bubble
            align={isOwn ? "end" : "start"}
            className={cn(
              "max-w-[85%] sm:max-w-[70%]",
              isDeleted
                ? "*:data-[slot=bubble-content]:border-dashed *:data-[slot=bubble-content]:border-muted-foreground/30 *:data-[slot=bubble-content]:bg-muted/40"
                : isOwn
                  ? "*:data-[slot=bubble-content]:bg-chat-outgoing *:data-[slot=bubble-content]:text-primary-foreground"
                  : "*:data-[slot=bubble-content]:bg-chat-incoming *:data-[slot=bubble-content]:text-foreground",
            )}
          >
            <BubbleContent
              className={cn(
                "rounded-2xl text-sm leading-relaxed transition-shadow",
                selectionMode && !isDeleted ? "cursor-pointer" : "select-none",
                isFile ? "p-1.5" : "px-4 py-2.5",
                !isDeleted && (isOwn ? "rounded-br-md" : "rounded-bl-md"),
                (highlighted || (selectionMode && isChecked)) && "ring-2 ring-primary/60",
              )}
              onClick={handleClick}
              onContextMenu={(e) => {
                if (isDeleted || selectionMode) return;
                e.preventDefault();
                onOpenMenu(e.clientX, e.clientY);
              }}
              onTouchStart={(e) => {
                if (isDeleted) return;
                const touch = e.touches[0];
                if (touch) longPress.start(touch.clientX, touch.clientY);
              }}
              onTouchEnd={longPress.clear}
              onTouchMove={longPress.clear}
            >
              {isDeleted ? (
                <span
                  className={cn("text-[15px] italic", isOwn ? "text-primary-foreground/75" : "text-muted-foreground")}
                >
                  {DELETED_MESSAGE_LABEL}
                </span>
              ) : isFile ? (
                <FileAttachment
                  room={message.room}
                  file={message.file!}
                  caption={attachmentCaption(message)}
                  isOwn={isOwn}
                  footer={
                    <MessageMeta
                      at={message.at}
                      isDeleted={isDeleted}
                      isOwn={isOwn}
                      isFile
                      deliveryStatus={deliveryStatus}
                    />
                  }
                />
              ) : (
                <span className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{message.text}</span>
              )}
              {!isFile && (
                <MessageMeta
                  at={message.at}
                  isDeleted={isDeleted}
                  isOwn={isOwn}
                  isFile={false}
                  deliveryStatus={deliveryStatus}
                />
              )}
            </BubbleContent>
          </Bubble>
          {!isOwn && <MessageFooter className="text-[10px]">{formatMessageTime(message.at)}</MessageFooter>}
        </MessageContent>
      </Message>
    </div>
  );
};
