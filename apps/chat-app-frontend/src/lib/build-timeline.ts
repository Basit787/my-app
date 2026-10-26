import type { CallHistoryEntry, ChatMessage } from "@/features/chat/api/api";

type TimelineItem =
  { kind: "message"; at: string; message: ChatMessage } | { kind: "call"; at: string; call: CallHistoryEntry };

// Messages and calls of a conversation in time order
export const buildTimeline = (messages: ChatMessage[], calls: CallHistoryEntry[]): TimelineItem[] => {
  const items: TimelineItem[] = [
    ...messages.map((message) => ({ kind: "message" as const, at: message.at, message })),
    ...calls.map((call) => ({ kind: "call" as const, at: call.startedAt, call })),
  ];
  return items.sort((a, b) => a.at.localeCompare(b.at));
};
