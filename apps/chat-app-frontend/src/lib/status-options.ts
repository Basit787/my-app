import type { UserStatus } from "@/features/chat/store/chat-store";

export const STATUS_OPTIONS: { value: UserStatus; label: string; color: string }[] = [
  { value: "online", label: "Online", color: "bg-online" },
  { value: "away", label: "Away", color: "bg-amber-400" },
  { value: "busy", label: "Busy", color: "bg-destructive" },
  { value: "offline", label: "Offline", color: "bg-muted-foreground/50" },
];
