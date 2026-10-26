import { formatMessageTime } from "frontend-common";
import { MessageStatus } from "@/components/chat/MessageStatus";
import { cn } from "@/lib/utils";
import type { MessageDeliveryStatus } from "@/features/chat/store/chat-store";

// Time and delivery ticks under your own messages
export const MessageMeta = ({
  at,
  isDeleted,
  isOwn,
  isFile,
  deliveryStatus,
}: {
  at: string;
  isDeleted: boolean;
  isOwn: boolean;
  isFile: boolean;
  deliveryStatus: MessageDeliveryStatus;
}) => {
  if (!isOwn) return null;

  return (
    <div className={cn("flex items-center justify-end gap-1", isFile ? "px-2 pb-1 pt-0.5" : "mt-1")}>
      <span className={cn("text-[10px]", isDeleted ? "text-muted-foreground" : "text-primary-foreground/70")}>
        {formatMessageTime(at)}
      </span>
      {!isDeleted && <MessageStatus status={deliveryStatus} className="text-primary-foreground/80" />}
    </div>
  );
};
