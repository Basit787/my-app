import { Phone, PhoneIncoming, PhoneMissed, PhoneOff, Video } from "lucide-react";
import { format } from "date-fns";
import { formatCallDuration, formatMessageTime } from "frontend-common";
import { cn } from "@/lib/utils";
import type { CallHistoryEntry } from "@/features/chat/api/api";

type CallHistoryItemProps = {
  call: CallHistoryEntry;
  selfUsername: string;
  compact?: boolean;
};

const getCallMeta = (call: CallHistoryEntry, selfUsername: string) => {
  const isOutgoing = call.caller === selfUsername;
  const peer = isOutgoing ? call.callee : call.caller;
  const isVideo = call.callType === "video";

  let label: string;
  if (isVideo) {
    label = isOutgoing ? "Outgoing video call" : "Incoming video call";
  } else {
    label = isOutgoing ? "Outgoing call" : "Incoming call";
  }

  let statusLabel = "";
  if (call.status === "completed") {
    statusLabel = formatCallDuration(call.durationSeconds) || "Completed";
  } else if (call.status === "missed") {
    statusLabel = "Missed";
  } else if (call.status === "rejected") {
    statusLabel = isOutgoing ? "Declined" : "Rejected";
  } else if (call.status === "cancelled") {
    statusLabel = "Cancelled";
  }

  const Icon =
    call.status === "missed" || call.status === "rejected"
      ? PhoneMissed
      : call.status === "cancelled"
        ? PhoneOff
        : isOutgoing
          ? Phone
          : PhoneIncoming;

  return { peer, label, statusLabel, Icon, isVideo, isOutgoing };
};

export const CallHistoryItem = ({ call, selfUsername, compact }: CallHistoryItemProps) => {
  const { peer, label, statusLabel, Icon, isVideo, isOutgoing } = getCallMeta(call, selfUsername);
  const DisplayIcon = isVideo ? Video : Icon;

  if (compact) {
    return (
      <div className="flex justify-center py-1">
        <div className="flex items-center gap-2 rounded-full bg-muted/80 px-3 py-1.5 text-[11px] text-muted-foreground">
          <DisplayIcon className="h-3 w-3 shrink-0" />
          <span>
            {peer} · {label}
            {statusLabel && ` · ${statusLabel}`}
          </span>
          <span className="opacity-70">{formatMessageTime(call.startedAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          call.status === "completed" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <DisplayIcon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {`${isOutgoing ? "To" : "From"} ${peer}`}
          {statusLabel && ` · ${statusLabel}`}
        </p>
      </div>
      <div className="shrink-0 text-right text-[11px] text-muted-foreground">
        <p>{formatMessageTime(call.startedAt)}</p>
        <p>{format(new Date(call.startedAt), "MMM d")}</p>
      </div>
    </div>
  );
};
