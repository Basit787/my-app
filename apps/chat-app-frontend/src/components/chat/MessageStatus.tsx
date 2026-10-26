import { Check, CheckCheck } from "lucide-react";
import type { MessageDeliveryStatus } from "@/features/chat/store/chat-types";
import { cn } from "@/lib/utils";

type MessageStatusProps = {
  status: MessageDeliveryStatus;
  className?: string;
};

export const MessageStatus = ({ status, className }: MessageStatusProps) => {
  if (status === "sent") {
    return <Check className={cn("h-3.5 w-3.5 shrink-0", className)} strokeWidth={2.5} />;
  }

  return (
    <CheckCheck
      className={cn("h-3.5 w-3.5 shrink-0", status === "read" ? "text-sky-300" : className)}
      strokeWidth={2.5}
    />
  );
};
