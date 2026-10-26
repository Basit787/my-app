import { Injectable } from "@nestjs/common";
import { canAccessRoom, isGroupRoom } from "@app/common";
import { GroupsService } from "./groups.service.js";

// The one place room access is decided: #general for everyone, DMs for their two users, groups for members
@Injectable()
export class RoomAccessService {
  constructor(private readonly groups: GroupsService) {}

  async canAccess(room: string, username: string): Promise<boolean> {
    if (canAccessRoom(room, username)) return true;
    return isGroupRoom(room) ? this.groups.isMember(room, username) : false;
  }
}
