import type { CallType, GroupCallState } from "@app/common";
import { Injectable } from "@nestjs/common";

type GroupCall = { callType: CallType; host: string; participants: Set<string> };

// Group calls in progress, one per group room (mesh: every participant connects to every other)
@Injectable()
export class GroupCallService {
  private readonly calls = new Map<string, GroupCall>();

  start(room: string, host: string, callType: CallType): GroupCallState | null {
    if (this.calls.has(room)) return null;
    this.calls.set(room, { callType, host, participants: new Set([host]) });
    return this.get(room);
  }

  join(room: string, username: string): GroupCallState | null {
    const call = this.calls.get(room);
    if (!call) return null;
    call.participants.add(username);
    return this.get(room);
  }

  // Returns the new state, or null when the call ended because nobody is left
  leave(room: string, username: string): GroupCallState | null {
    const call = this.calls.get(room);
    if (!call) return null;
    call.participants.delete(username);
    if (call.participants.size === 0) {
      this.calls.delete(room);
      return null;
    }
    return this.get(room);
  }

  get(room: string): GroupCallState | null {
    const call = this.calls.get(room);
    return call ? { room, callType: call.callType, host: call.host, participants: [...call.participants] } : null;
  }

  // States after removing the user from every call; an empty participant list means that call ended
  removeUserFromAll(username: string): GroupCallState[] {
    const updates: GroupCallState[] = [];
    for (const room of [...this.calls.keys()]) {
      const call = this.calls.get(room)!;
      if (!call.participants.has(username)) continue;
      const state = this.leave(room, username);
      updates.push(state ?? { room, callType: call.callType, host: call.host, participants: [] });
    }
    return updates;
  }
}
