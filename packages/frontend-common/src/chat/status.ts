import type { ChatMessage, MessageDeliveryStatus } from "./types";

const STATUS_RANK: Record<MessageDeliveryStatus, number> = { sent: 0, delivered: 1, read: 2 };

// Statuses only move forward (sent → delivered → read)
export const furthestStatus = (a: MessageDeliveryStatus, b: MessageDeliveryStatus) =>
  STATUS_RANK[b] > STATUS_RANK[a] ? b : a;

export const resolveDeliveryStatus = (message: ChatMessage, live: MessageDeliveryStatus | undefined) =>
  furthestStatus(message.status ?? "sent", live ?? "sent");
