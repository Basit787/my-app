import { isValidRoom, wsValidationPipe, type CallHistoryDto, type GroupCallState, type SocketUser } from "@app/common";
import { UsePipes } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from "@nestjs/websockets";
import type { Socket } from "socket.io";
import { GroupsService } from "../groups/groups.service.js";
import { RoomAccessService } from "../groups/room-access.service.js";
import { NotificationsService } from "@app/notifications";
import { RealtimeService, userRoom } from "@app/realtime";
import { CallSessionService } from "./call-session.service.js";
import { CallsService } from "./calls.service.js";
import {
  GroupIceCandidateDto,
  GroupRoomDto,
  GroupSdpDto,
  GroupStartDto,
  IceCandidateDto,
  InviteDto,
  SdpDto,
  SignalTargetDto,
} from "./dto/call-events.dto.js";
import { GroupCallService } from "./group-call.service.js";

const userOf = (socket: Socket): SocketUser => socket.data.user;

// WebRTC signaling. 1:1: an invite rings every device of the callee and the device that answers takes the call.
// Group: mesh signaling inside a group room; relays reach all devices of the target and only the one in the call acts.
@WebSocketGateway()
@UsePipes(wsValidationPipe())
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly calls: CallsService,
    private readonly sessions: CallSessionService,
    private readonly groupCalls: GroupCallService,
    private readonly groups: GroupsService,
    private readonly roomAccess: RoomAccessService,
    private readonly realtime: RealtimeService,
    private readonly push: NotificationsService,
  ) {}

  // A callee device that connects while a call is still ringing (e.g. opened from a push) gets it replayed
  handleConnection(socket: Socket) {
    const user = userOf(socket);
    const session = this.sessions.findRinging(user.username);
    if (!session) return;
    socket.emit("call:incoming", { from: session.caller, callType: session.callType });
    if (session.offer) socket.emit("call:offer", { from: session.caller, sdp: session.offer });
    for (const candidate of session.callerIce) socket.emit("call:ice-candidate", { from: session.caller, candidate });
    this.realtime.io.to(session.callerSocketId).emit("call:ringing", { from: user.username });
  }

  handleDisconnect(socket: Socket) {
    const user = userOf(socket);
    // A caller that drops before the callee answers would otherwise leave the callee ringing
    for (const session of this.sessions.unansweredFromSocket(socket.id)) {
      this.realtime.emitToUser(session.callee, "call:end", { from: session.caller });
      this.sessions.end(session.caller, session.callee);
      void this.calls.recordEnd(session.caller, session.callee).then((entry) => this.broadcastHistory(entry));
    }
    // Leave group calls only when the user's last device is gone
    if (this.realtime.deviceCount(user.username) > 0) return;
    for (const state of this.groupCalls.removeUserFromAll(user.username)) {
      if (state.participants.length === 0) void this.emitGroupEnded(state.room);
      else void this.emitGroupState(state);
    }
  }

  @SubscribeMessage("call:invite")
  invite(@ConnectedSocket() socket: Socket, @MessageBody() { to, callType }: InviteDto) {
    const user = userOf(socket);
    if (to === user.username) return;
    this.calls.trackInvite(user.username, to, callType);
    this.sessions.start(user.username, to, callType, socket.id);
    this.realtime.emitToUser(to, "call:incoming", { from: user.username, callType });
    // Lets the caller show "Ringing" (callee's app got the call) instead of "Calling…"
    if (this.realtime.deviceCount(to) > 0) socket.emit("call:ringing", { from: to });
    void this.push.notifyIncomingCall(to, user.username, callType);
  }

  @SubscribeMessage("call:offer")
  offer(@ConnectedSocket() socket: Socket, @MessageBody() { to, sdp }: SdpDto) {
    const user = userOf(socket);
    const session = this.sessions.get(user.username, to);
    if (session?.caller === user.username) session.offer = sdp;
    const payload = { from: user.username, sdp };
    if (session?.calleeSocketId) this.realtime.io.to(session.calleeSocketId).emit("call:offer", payload);
    else this.realtime.emitToUser(to, "call:offer", payload);
  }

  @SubscribeMessage("call:answer")
  answer(@ConnectedSocket() socket: Socket, @MessageBody() { to, sdp }: SdpDto) {
    const user = userOf(socket);
    const session = this.sessions.get(user.username, to);
    this.calls.trackAnswer(to, user.username);
    if (!session) {
      this.realtime.emitToUser(to, "call:answer", { from: user.username, sdp });
      return;
    }
    session.calleeSocketId = socket.id;
    this.realtime.io.to(session.callerSocketId).emit("call:answer", { from: user.username, sdp });
    // Stop the callee's other devices from ringing
    socket.to(userRoom(user.username)).emit("call:end", { from: to });
  }

  @SubscribeMessage("call:ice-candidate")
  iceCandidate(@ConnectedSocket() socket: Socket, @MessageBody() { to, candidate }: IceCandidateDto) {
    const user = userOf(socket);
    const session = this.sessions.get(user.username, to);
    const payload = { from: user.username, candidate };
    if (!session) {
      this.realtime.emitToUser(to, "call:ice-candidate", payload);
    } else if (session.caller !== user.username) {
      this.realtime.io.to(session.callerSocketId).emit("call:ice-candidate", payload);
    } else if (session.calleeSocketId) {
      this.realtime.io.to(session.calleeSocketId).emit("call:ice-candidate", payload);
    } else {
      // Kept for callee devices that connect later
      session.callerIce.push(candidate);
      this.realtime.emitToUser(to, "call:ice-candidate", payload);
    }
  }

  @SubscribeMessage("call:end")
  end(@ConnectedSocket() socket: Socket, @MessageBody() { to }: SignalTargetDto) {
    const user = userOf(socket);
    const session = this.sessions.get(user.username, to);
    const payload = { from: user.username };
    if (session?.caller === user.username && session.calleeSocketId) {
      this.realtime.io.to(session.calleeSocketId).emit("call:end", payload);
    } else if (session && session.caller !== user.username) {
      this.realtime.io.to(session.callerSocketId).emit("call:end", payload);
    } else {
      this.realtime.emitToUser(to, "call:end", payload);
    }
    this.sessions.end(user.username, to);
    void this.calls.recordEnd(user.username, to).then((entry) => this.broadcastHistory(entry));
  }

  @SubscribeMessage("call:reject")
  reject(@ConnectedSocket() socket: Socket, @MessageBody() { to }: SignalTargetDto) {
    const user = userOf(socket);
    const session = this.sessions.get(user.username, to);
    if (session) this.realtime.io.to(session.callerSocketId).emit("call:reject", { from: user.username });
    else this.realtime.emitToUser(to, "call:reject", { from: user.username });
    socket.to(userRoom(user.username)).emit("call:end", { from: to });
    this.sessions.end(user.username, to);
    void this.calls.recordReject(to, user.username).then((entry) => this.broadcastHistory(entry));
  }

  @SubscribeMessage("group-call:start")
  async groupStart(@ConnectedSocket() socket: Socket, @MessageBody() { room, callType }: GroupStartDto) {
    const user = userOf(socket);
    if (!(await this.canUseRoom(room, user))) return;
    const state = this.groupCalls.start(room, user.username, callType);
    if (!state) return;
    await this.emitGroupIncoming(state);
    await this.emitGroupState(state);
    void this.push.notifyGroupCall(state);
  }

  @SubscribeMessage("group-call:join")
  async groupJoin(@ConnectedSocket() socket: Socket, @MessageBody() { room }: GroupRoomDto) {
    const user = userOf(socket);
    if (!(await this.canUseRoom(room, user))) return;
    const state = this.groupCalls.join(room, user.username);
    if (state) await this.emitGroupState(state);
  }

  @SubscribeMessage("group-call:leave")
  async groupLeave(@ConnectedSocket() socket: Socket, @MessageBody() { room }: GroupRoomDto) {
    const state = this.groupCalls.leave(room, userOf(socket).username);
    if (state) await this.emitGroupState(state);
    else await this.emitGroupEnded(room);
  }

  @SubscribeMessage("group-call:offer")
  async groupOffer(@ConnectedSocket() socket: Socket, @MessageBody() { room, to, sdp }: GroupSdpDto) {
    const user = userOf(socket);
    if (await this.roomAccess.canAccess(room, user.username)) {
      this.realtime.emitToUser(to, "group-call:offer", { from: user.username, room, sdp });
    }
  }

  @SubscribeMessage("group-call:answer")
  async groupAnswer(@ConnectedSocket() socket: Socket, @MessageBody() { room, to, sdp }: GroupSdpDto) {
    const user = userOf(socket);
    if (await this.roomAccess.canAccess(room, user.username)) {
      this.realtime.emitToUser(to, "group-call:answer", { from: user.username, room, sdp });
    }
  }

  @SubscribeMessage("group-call:ice-candidate")
  async groupIce(@ConnectedSocket() socket: Socket, @MessageBody() { room, to, candidate }: GroupIceCandidateDto) {
    const user = userOf(socket);
    if (await this.roomAccess.canAccess(room, user.username)) {
      this.realtime.emitToUser(to, "group-call:ice-candidate", { from: user.username, room, candidate });
    }
  }

  private canUseRoom(room: string, user: SocketUser) {
    return isValidRoom(room) ? this.roomAccess.canAccess(room, user.username) : Promise.resolve(false);
  }

  private broadcastHistory(entry: CallHistoryDto | null) {
    if (!entry) return;
    for (const username of [entry.caller, entry.callee]) this.realtime.emitToUser(username, "call:history", entry);
  }

  private async emitGroupIncoming(state: GroupCallState) {
    const members = (await this.groups.getMembersForRoom(state.room)) ?? [];
    for (const member of members) {
      if (!state.participants.includes(member)) this.realtime.emitToUser(member, "group-call:incoming", state);
    }
  }

  private async emitGroupState(state: GroupCallState) {
    const members = (await this.groups.getMembersForRoom(state.room)) ?? [];
    for (const member of members) this.realtime.emitToUser(member, "group-call:state", state);
  }

  private async emitGroupEnded(room: string) {
    const members = (await this.groups.getMembersForRoom(room)) ?? [];
    for (const member of members) this.realtime.emitToUser(member, "group-call:ended", { room });
  }
}
