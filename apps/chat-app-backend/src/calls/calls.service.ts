import {
  appConfig,
  type AppConfig,
  type CallHistoryDto,
  type CallStatus,
  type CallType,
  type WebRTCConfigResponse,
} from "@app/common";
import { Inject, Injectable } from "@nestjs/common";
import { CallHistoryRepository } from "@app/db";

type ActiveCall = { caller: string; callee: string; callType: CallType; startedAt: Date; answeredAt: Date | null };

type CallHistoryFields = {
  _id: { toString(): string };
  caller: string;
  callee: string;
  callType: CallType;
  status: CallStatus;
  startedAt: Date;
  endedAt: Date;
  durationSeconds?: number;
};

const HISTORY_LIMIT = 50;

export const pairKey = (a: string, b: string) => [a, b].sort().join("..");

const toDto = (doc: CallHistoryFields): CallHistoryDto => ({
  id: doc._id.toString(),
  caller: doc.caller,
  callee: doc.callee,
  callType: doc.callType,
  status: doc.status,
  startedAt: doc.startedAt.toISOString(),
  endedAt: doc.endedAt.toISOString(),
  durationSeconds: doc.durationSeconds,
});

// 1:1 call history: in-flight calls in memory, finished ones saved when they end
@Injectable()
export class CallsService {
  private readonly active = new Map<string, ActiveCall>();

  constructor(
    private readonly history: CallHistoryRepository,
    @Inject(appConfig.KEY) private readonly config: AppConfig,
  ) {}

  trackInvite(caller: string, callee: string, callType: CallType) {
    this.active.set(pairKey(caller, callee), { caller, callee, callType, startedAt: new Date(), answeredAt: null });
  }

  trackAnswer(caller: string, callee: string) {
    const call = this.active.get(pairKey(caller, callee));
    if (call) call.answeredAt = new Date();
  }

  async recordEnd(userA: string, userB: string): Promise<CallHistoryDto | null> {
    const call = this.active.get(pairKey(userA, userB));
    if (!call) return null;
    return this.finalize(call, call.answeredAt ? "completed" : "cancelled");
  }

  async recordReject(caller: string, callee: string): Promise<CallHistoryDto | null> {
    const call = this.active.get(pairKey(caller, callee));
    return call ? this.finalize(call, "rejected") : null;
  }

  async getUserHistory(username: string, peer?: string): Promise<CallHistoryDto[]> {
    return (await this.history.findForUser(username, HISTORY_LIMIT, peer)).map(toDto);
  }

  iceServers(): WebRTCConfigResponse {
    const { host, port, user, password } = this.config.turn;
    return {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: `stun:${host}:${port}` },
        { urls: `turn:${host}:${port}`, username: user, credential: password },
      ],
    };
  }

  private async finalize(call: ActiveCall, status: CallStatus): Promise<CallHistoryDto> {
    const endedAt = new Date();
    const durationSeconds =
      call.answeredAt && status === "completed"
        ? Math.max(0, Math.round((endedAt.getTime() - call.answeredAt.getTime()) / 1000))
        : undefined;
    const doc = await this.history.create({ ...call, status, endedAt, durationSeconds });
    this.active.delete(pairKey(call.caller, call.callee));
    return toDto(doc);
  }
}
