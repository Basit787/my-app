import type { PresencePayload, PresenceStatus } from "@app/common";
import { Injectable } from "@nestjs/common";
import { UserPresenceRepository } from "@app/db";
import { RealtimeService } from "@app/realtime";

// Who is connected per room (in memory, single server instance) plus each user's chosen status
@Injectable()
export class PresenceService {
  private readonly online = new Map<string, Set<string>>();
  private readonly statusCache = new Map<string, PresenceStatus>();

  constructor(
    private readonly presence: UserPresenceRepository,
    private readonly realtime: RealtimeService,
  ) {}

  join(room: string, username: string) {
    if (!this.online.has(room)) this.online.set(room, new Set());
    this.online.get(room)!.add(username);
  }

  leave(room: string, username: string) {
    this.online.get(room)?.delete(username);
  }

  async getStatus(username: string): Promise<PresenceStatus> {
    const cached = this.statusCache.get(username);
    if (cached) return cached;
    const status = (await this.presence.findStatus(username)) ?? "online";
    this.statusCache.set(username, status);
    return status;
  }

  async setStatus(username: string, status: PresenceStatus): Promise<PresenceStatus> {
    await this.presence.saveStatus(username, status);
    this.statusCache.set(username, status);
    return status;
  }

  async getStatuses(usernames: string[]): Promise<Record<string, PresenceStatus>> {
    const result: Record<string, PresenceStatus> = {};
    const missing: string[] = [];
    for (const username of new Set(usernames)) {
      const cached = this.statusCache.get(username);
      if (cached) result[username] = cached;
      else missing.push(username);
    }
    if (missing.length > 0) {
      const byName = await this.presence.findStatuses(missing);
      for (const username of missing) {
        const status = byName.get(username) ?? "online";
        this.statusCache.set(username, status);
        result[username] = status;
      }
    }
    return result;
  }

  async snapshot(room: string): Promise<PresencePayload> {
    const users = [...(this.online.get(room) ?? [])];
    const statuses = await this.getStatuses(users);
    return { room, count: users.length, users, statuses };
  }

  // Sends the room's presence to everyone in it
  async broadcast(room: string) {
    this.realtime.io.to(room).emit("presence", await this.snapshot(room));
  }
}
