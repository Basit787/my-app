import {
  dmRoomAliases,
  parseDmRoom,
  type AuthUser,
  type ChatMessageDto,
  type MessageDeliveryStatus,
  type MessageFileDto,
} from "@app/common";
import { MessageRepository } from "@app/db";
import { Injectable } from "@nestjs/common";
import type { Types } from "mongoose";
import { GroupsService } from "../groups/groups.service.js";

export type StatusUpdate = { messageId: string; sender: string; status: MessageDeliveryStatus };

type ReceiptFields = { _id: Types.ObjectId; room: string; user: string; deliveredTo?: string[]; readBy?: string[] };

type MessageFields = {
  id: string;
  room: string;
  user: string;
  text: string;
  type?: "text" | "file";
  file?: MessageFileDto;
  deleted?: boolean;
  at: Date;
};

const HISTORY_LIMIT = 200;

const dmRoomsToQuery = (room: string): string[] => {
  const participants = parseDmRoom(room);
  return participants ? dmRoomAliases(participants[0], participants[1]) : [room];
};

const deliveryStatus = (
  message: { user: string; deliveredTo?: string[]; readBy?: string[] },
  recipients: string[] | null,
): MessageDeliveryStatus => {
  const readBy = message.readBy ?? [];
  const deliveredTo = message.deliveredTo ?? [];
  // Open channel: no fixed audience, so any reader/receiver counts
  if (!recipients) {
    if (readBy.length > 0) return "read";
    return deliveredTo.length > 0 ? "delivered" : "sent";
  }
  const others = recipients.filter((u) => u !== message.user);
  if (others.length === 0) return "sent";
  if (others.every((u) => readBy.includes(u))) return "read";
  if (others.every((u) => readBy.includes(u) || deliveredTo.includes(u))) return "delivered";
  return "sent";
};

const toDto = (message: MessageFields): ChatMessageDto => {
  const deleted = message.deleted ?? false;
  return {
    id: message.id,
    room: message.room,
    user: message.user,
    text: deleted ? "" : message.text,
    type: deleted ? "text" : (message.type ?? "text"),
    file: deleted ? undefined : message.file,
    deleted,
    at: message.at.toISOString(),
  };
};

@Injectable()
export class MessagesService {
  constructor(
    private readonly messages: MessageRepository,
    private readonly groups: GroupsService,
  ) {}

  // Everyone expected to receive messages in a room, or null when membership is open (#general)
  private roomRecipients(room: string): Promise<string[] | null> {
    const dm = parseDmRoom(room);
    return dm ? Promise.resolve(dm) : this.groups.getMembersForRoom(room);
  }

  async getRoomMessages(room: string, viewer: string): Promise<ChatMessageDto[]> {
    const [messages, recipients] = await Promise.all([
      this.messages.findInRooms(dmRoomsToQuery(room), HISTORY_LIMIT),
      this.roomRecipients(room),
    ]);
    return messages.map((m) => ({
      ...toDto({ ...m, id: m._id.toString() }),
      ...(m.user === viewer ? { status: deliveryStatus(m, recipients) } : {}),
    }));
  }

  // Records that `username` received `message`; returns the sender's new status for it
  async markDelivered(message: ReceiptFields, username: string): Promise<StatusUpdate> {
    const [, recipients] = await Promise.all([
      this.messages.addDelivered(message._id, username),
      this.roomRecipients(message.room),
    ]);
    const status = deliveryStatus({ ...message, deliveredTo: [...(message.deliveredTo ?? []), username] }, recipients);
    return { messageId: message._id.toString(), sender: message.user, status };
  }

  // Marks every message in the room up to `upTo` as read by `reader`; returns each changed message's status
  async markRoomRead(room: string, upTo: Date, reader: string): Promise<StatusUpdate[]> {
    const unread = await this.messages.findUnread(dmRoomsToQuery(room), reader, upTo);
    if (unread.length === 0) return [];

    const [, recipients] = await Promise.all([
      this.messages.markRead(
        unread.map((m) => m._id),
        reader,
      ),
      this.roomRecipients(room),
    ]);
    // Status after the update, computed in memory instead of re-reading the documents
    return unread.map((m) => ({
      messageId: m._id.toString(),
      sender: m.user,
      status: deliveryStatus(
        { user: m.user, readBy: [...m.readBy, reader], deliveredTo: [...m.deliveredTo, reader] },
        recipients,
      ),
    }));
  }

  async createMessage(room: string, user: AuthUser, text: string): Promise<ChatMessageDto> {
    const at = new Date();
    const doc = await this.messages.create({ room, user: user.username, userId: user.id, type: "text", text, at });
    return toDto({ id: doc._id.toString(), room, user: user.username, text, type: "text", at });
  }

  async createFileMessage(
    room: string,
    user: AuthUser,
    file: MessageFileDto,
    caption?: string,
  ): Promise<ChatMessageDto> {
    const at = new Date();
    // The file name is stored as the text when there is no caption
    const text = caption?.trim() || file.name;
    const doc = await this.messages.create({
      room,
      user: user.username,
      userId: user.id,
      type: "file",
      text,
      file,
      at,
    });
    return toDto({ id: doc._id.toString(), room, user: user.username, text, type: "file", file, at });
  }

  getMessageById(id: string) {
    return this.messages.findByIdLean(id);
  }

  async softDelete(id: string): Promise<ChatMessageDto | null> {
    const doc = await this.messages.softDelete(id);
    return doc ? toDto({ ...doc, id: doc._id.toString() }) : null;
  }
}
