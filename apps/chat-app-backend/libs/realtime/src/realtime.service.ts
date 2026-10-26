import { GENERAL_ROOM, parseDmRoom, parseGroupRoom } from "@app/common";
import { ChatGroupRepository } from "@app/db";
import { Injectable } from "@nestjs/common";
import type { Server } from "socket.io";

export const userRoom = (username: string) => `user:${username}`;

// Emits to people rather than to joined rooms, so users get DM/group events even when that chat is not open
@Injectable()
export class RealtimeService {
  private server: Server | null = null;

  constructor(private readonly groups: ChatGroupRepository) {}

  // Called by the app's ChatGateway once Socket.IO is up
  attach(server: Server) {
    this.server = server;
  }

  get io(): Server {
    if (!this.server) throw new Error("Socket.IO server is not ready");
    return this.server;
  }

  emitToUser(username: string, event: string, payload: unknown) {
    this.io.to(userRoom(username)).emit(event, payload);
  }

  // Number of this user's connected devices (web tabs, phones)
  deviceCount(username: string) {
    return this.io.sockets.adapter.rooms.get(userRoom(username))?.size ?? 0;
  }

  async emitToRoomParticipants(room: string, event: string, payload: unknown) {
    if (room === GENERAL_ROOM) {
      this.io.to(GENERAL_ROOM).emit(event, payload);
      return;
    }
    const groupId = parseGroupRoom(room);
    const members = parseDmRoom(room) ?? (groupId ? (await this.groups.findMembers(groupId))?.members : null) ?? [];
    for (const member of members) this.emitToUser(member, event, payload);
  }
}
