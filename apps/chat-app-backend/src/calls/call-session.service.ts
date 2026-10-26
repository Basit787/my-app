import type { CallType } from "@app/common";
import { Injectable } from "@nestjs/common";
import { pairKey } from "./calls.service.js";

// Signaling state of a 1:1 call: which caller socket started it and which callee device answered
export type CallSession = {
  caller: string;
  callee: string;
  callType: CallType;
  callerSocketId: string;
  calleeSocketId: string | null;
  offer: unknown;
  callerIce: unknown[];
  startedAt: number;
};

const RING_TIMEOUT_MS = 45_000;

@Injectable()
export class CallSessionService {
  private readonly sessions = new Map<string, CallSession>();

  start(caller: string, callee: string, callType: CallType, callerSocketId: string): CallSession {
    const session: CallSession = {
      caller,
      callee,
      callType,
      callerSocketId,
      calleeSocketId: null,
      offer: null,
      callerIce: [],
      startedAt: Date.now(),
    };
    this.sessions.set(pairKey(caller, callee), session);
    return session;
  }

  get(userA: string, userB: string): CallSession | null {
    return this.sessions.get(pairKey(userA, userB)) ?? null;
  }

  end(userA: string, userB: string) {
    this.sessions.delete(pairKey(userA, userB));
  }

  // An unanswered call still ringing for this user, replayed to a device that connects late (e.g. from a push)
  findRinging(callee: string): CallSession | null {
    for (const session of this.sessions.values()) {
      if (session.callee === callee && !session.calleeSocketId && Date.now() - session.startedAt < RING_TIMEOUT_MS) {
        return session;
      }
    }
    return null;
  }

  unansweredFromSocket(socketId: string): CallSession[] {
    return [...this.sessions.values()].filter((s) => s.callerSocketId === socketId && !s.calleeSocketId);
  }
}
