import { parseDmRoom, parseGroupRoom, type CallType, type ChatMessageDto, type GroupCallState } from "@app/common";
import { Injectable, Logger } from "@nestjs/common";
import { ChatGroupRepository, PushTokenRepository } from "@app/db";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_BATCH_SIZE = 100;
// Matches the clients' no-answer timeout, so a stale call push is not delivered late
const CALL_PUSH_TTL_SECONDS = 45;

type PushMessage = {
  title: string;
  body: string;
  data: Record<string, unknown>;
  // Android notification channels created by the mobile app
  channelId: "messages" | "calls";
  sound?: string;
  ttl?: number;
  // Notification category registered by the mobile app (adds Answer / Decline buttons)
  categoryId?: "call";
};

type ExpoPushResponse = { data?: { status: string; details?: { error?: string } }[] };

const messageBody = (message: ChatMessageDto) => {
  if (message.type !== "file" || !message.file) return message.text;
  const mime = message.file.mimeType;
  if (mime.startsWith("image/")) return "📷 Photo";
  if (mime.startsWith("video/")) return "🎥 Video";
  if (mime.startsWith("audio/")) return "🎤 Voice message";
  return `📄 ${message.file.name}`;
};

// Expo push notifications for the mobile app; every notifier swallows its own errors so chat never breaks
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly tokens: PushTokenRepository,
    private readonly groups: ChatGroupRepository,
  ) {}

  async register(username: string, token: string, platform = "") {
    await this.tokens.upsert(token, username, platform);
  }

  async remove(username: string, token: string) {
    await this.tokens.removeForUser(token, username);
  }

  // DMs and groups only; #general would notify everyone for every message
  notifyMessage(message: ChatMessageDto) {
    return this.safely(async () => {
      const data = { type: "message", room: message.room };
      const dm = parseDmRoom(message.room);
      if (dm) {
        const recipients = dm.filter((name) => name !== message.user);
        await this.send(recipients, { title: message.user, body: messageBody(message), data, channelId: "messages" });
        return;
      }
      const group = await this.groupInfo(message.room);
      if (!group) return;
      await this.send(
        group.members.filter((name) => name !== message.user),
        { title: group.name, body: `${message.user}: ${messageBody(message)}`, data, channelId: "messages" },
      );
    });
  }

  notifyIncomingCall(callee: string, caller: string, callType: CallType) {
    return this.safely(() =>
      this.send([callee], {
        title: caller,
        body: callType === "video" ? "Incoming video call" : "Incoming audio call",
        data: { type: "call", from: caller, callType },
        channelId: "calls",
        sound: "ringtone.wav",
        ttl: CALL_PUSH_TTL_SECONDS,
        categoryId: "call",
      }),
    );
  }

  notifyGroupCall(state: GroupCallState) {
    return this.safely(async () => {
      const group = await this.groupInfo(state.room);
      if (!group) return;
      await this.send(
        group.members.filter((name) => !state.participants.includes(name)),
        {
          title: group.name,
          body: `${state.host} started a group ${state.callType} call`,
          data: { type: "group-call", room: state.room },
          channelId: "calls",
          sound: "ringtone.wav",
          ttl: CALL_PUSH_TTL_SECONDS,
        },
      );
    });
  }

  private async groupInfo(room: string) {
    const id = parseGroupRoom(room);
    return id ? this.groups.findNameAndMembers(id) : null;
  }

  private async safely(task: () => Promise<void>) {
    try {
      await task();
    } catch (error) {
      this.logger.warn(`Push notification failed: ${String(error)}`);
    }
  }

  private async send(usernames: string[], message: PushMessage) {
    if (usernames.length === 0) return;
    const tokens = await this.tokens.findTokens(usernames);

    for (let i = 0; i < tokens.length; i += EXPO_BATCH_SIZE) {
      const batch = tokens.slice(i, i + EXPO_BATCH_SIZE);
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(
          batch.map((to) => ({
            to,
            title: message.title,
            body: message.body,
            data: message.data,
            channelId: message.channelId,
            sound: message.sound ?? "default",
            priority: "high",
            ttl: message.ttl,
            categoryId: message.categoryId,
          })),
        ),
      });
      if (!response.ok) {
        this.logger.warn(`Expo push failed with ${response.status}`);
        continue;
      }
      const result = (await response.json()) as ExpoPushResponse;
      const stale = batch.filter((_, index) => result.data?.[index]?.details?.error === "DeviceNotRegistered");
      if (stale.length > 0) await this.tokens.deleteMany({ token: { $in: stale } });
    }
  }
}
