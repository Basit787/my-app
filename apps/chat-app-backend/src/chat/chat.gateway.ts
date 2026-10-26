import {
  dmRoomsMatch,
  GENERAL_ROOM,
  isValidRoom,
  wsValidationPipe,
  type SocketUser,
  type TypingPayload,
} from "@app/common";
import { UsePipes } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  type OnGatewayConnection,
  type OnGatewayInit,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { GroupCallService } from "../calls/group-call.service.js";
import { GroupsService } from "../groups/groups.service.js";
import { RoomAccessService } from "../groups/room-access.service.js";
import { MessagesService, type StatusUpdate } from "../messages/messages.service.js";
import { NotificationsService } from "@app/notifications";
import { RealtimeService, userRoom } from "@app/realtime";
import { PresenceService } from "../users/presence.service.js";
import { ReceiptDto, RoomPayloadDto, SendMessageDto, StatusDto } from "./dto/chat-events.dto.js";

const userOf = (socket: Socket): SocketUser => socket.data.user;

// Chat over Socket.IO: rooms, presence, typing, messages and read receipts
@WebSocketGateway()
@UsePipes(wsValidationPipe())
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  constructor(
    private readonly realtime: RealtimeService,
    private readonly presence: PresenceService,
    private readonly messages: MessagesService,
    private readonly groups: GroupsService,
    private readonly groupCalls: GroupCallService,
    private readonly roomAccess: RoomAccessService,
    private readonly push: NotificationsService,
  ) {}

  afterInit(server: Server) {
    this.realtime.attach(server);
  }

  // Every socket joins #general and its user's personal room (where DM/group events are delivered)
  async handleConnection(socket: Socket) {
    const user = userOf(socket);
    await socket.join([GENERAL_ROOM, userRoom(user.username)]);
    this.presence.join(GENERAL_ROOM, user.username);
    await this.presence.broadcast(GENERAL_ROOM);

    // Rooms are still known while disconnecting; the user stays present while another device is connected
    socket.on("disconnecting", () => {
      if (this.realtime.deviceCount(user.username) > 1) return;
      for (const room of socket.rooms) {
        if (room === socket.id || !isValidRoom(room)) continue;
        this.presence.leave(room, user.username);
        void this.presence.broadcast(room);
      }
    });

    for (const group of await this.groups.listForUser(user.username)) {
      const state = this.groupCalls.get(group.room);
      if (state) socket.emit("group-call:state", state);
    }
  }

  @SubscribeMessage("status:set")
  async setStatus(@ConnectedSocket() socket: Socket, @MessageBody() { status }: StatusDto) {
    await this.presence.setStatus(userOf(socket).username, status);
    await this.presence.broadcast(GENERAL_ROOM);
  }

  @SubscribeMessage("room:join")
  async joinRoom(@ConnectedSocket() socket: Socket, @MessageBody() { room }: RoomPayloadDto) {
    if (isValidRoom(room) && (await this.roomAccess.canAccess(room, userOf(socket).username))) await socket.join(room);
  }

  @SubscribeMessage("room:leave")
  async leaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() { room }: RoomPayloadDto) {
    if (room !== GENERAL_ROOM) await socket.leave(room);
  }

  @SubscribeMessage("typing")
  typing(@ConnectedSocket() socket: Socket, @MessageBody() { room }: RoomPayloadDto) {
    if (!socket.rooms.has(room)) return;
    const payload: TypingPayload = { room, username: userOf(socket).username };
    socket.to(room).emit("typing", payload);
  }

  // No joined-room check: access is verified here, and forwarding sends to rooms that are not open
  @SubscribeMessage("message")
  async message(@ConnectedSocket() socket: Socket, @MessageBody() { room, text }: SendMessageDto) {
    const user = userOf(socket);
    if (!isValidRoom(room) || !(await this.roomAccess.canAccess(room, user.username))) return;
    const message = await this.messages.createMessage(room, user, text);
    await this.realtime.emitToRoomParticipants(room, "message", message);
    void this.push.notifyMessage(message);
  }

  @SubscribeMessage("message:ack")
  async ack(@ConnectedSocket() socket: Socket, @MessageBody() body: ReceiptDto) {
    const user = userOf(socket);
    const message = await this.findReceiptMessage(body, user);
    if (message) this.emitStatus(await this.messages.markDelivered(message, user.username));
  }

  // Everything up to the newest seen message counts as read, not just that one message
  @SubscribeMessage("room:read")
  async read(@ConnectedSocket() socket: Socket, @MessageBody() body: ReceiptDto) {
    const user = userOf(socket);
    const message = await this.findReceiptMessage(body, user);
    if (!message) return;
    for (const update of await this.messages.markRoomRead(message.room, message.at, user.username)) {
      this.emitStatus(update);
    }
  }

  // A receipt target: someone else's live message in a room this user can access
  private async findReceiptMessage({ room, messageId }: ReceiptDto, user: SocketUser) {
    if (!isValidRoom(room) || !(await this.roomAccess.canAccess(room, user.username))) return null;
    const message = await this.messages.getMessageById(messageId);
    if (!message || !dmRoomsMatch(message.room, room) || message.user === user.username || message.deleted) {
      return null;
    }
    return message;
  }

  private emitStatus({ sender, messageId, status }: StatusUpdate) {
    this.realtime.emitToUser(sender, "message:status", { messageId, status });
  }
}
