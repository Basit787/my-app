import { groupRoomName, parseGroupRoom, type ChatGroupDto, type UploadedFileData } from "@app/common";
import { StorageService } from "@app/storage";
import { ChatGroupRepository, type ChatGroupDocument } from "@app/db";
import { Injectable } from "@nestjs/common";
import path from "node:path";

const AVATAR_PREFIX = "group-avatars/";

const toDto = (doc: ChatGroupDocument): ChatGroupDto => {
  const id = doc._id.toString();
  return {
    id,
    name: doc.name,
    description: doc.description ?? "",
    image: doc.image ?? "",
    room: groupRoomName(id),
    members: doc.members,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

@Injectable()
export class GroupsService {
  constructor(
    private readonly groups: ChatGroupRepository,
    private readonly storage: StorageService,
  ) {}

  async listForUser(username: string): Promise<ChatGroupDto[]> {
    return (await this.groups.findForMember(username)).map(toDto);
  }

  async getById(groupId: string, username: string): Promise<ChatGroupDto | null> {
    const group = await this.groups.findById(groupId);
    if (!group || !group.members.includes(username)) return null;
    return toDto(group);
  }

  async create(name: string, members: string[], createdBy: string, description = ""): Promise<ChatGroupDto> {
    const doc = await this.groups.create({
      name: name.trim(),
      description: description.trim(),
      members: [...new Set([createdBy, ...members])],
      createdBy,
    });
    return toDto(doc);
  }

  // Only the creator may change a group; returns null otherwise
  async update(
    groupId: string,
    username: string,
    data: { name?: string; description?: string; image?: string },
  ): Promise<ChatGroupDto | null> {
    const group = await this.groups.findById(groupId);
    if (!group || !group.members.includes(username) || group.createdBy !== username) return null;
    if (data.name !== undefined) group.name = data.name.trim();
    if (data.description !== undefined) group.description = data.description.trim();
    if (data.image !== undefined) group.image = data.image;
    return toDto(await this.groups.save(group));
  }

  setImage(groupId: string, username: string, image: string) {
    return this.update(groupId, username, { image });
  }

  async isMember(room: string, username: string): Promise<boolean> {
    const id = parseGroupRoom(room);
    if (!id) return false;
    return (await this.groups.findMembers(id))?.members.includes(username) ?? false;
  }

  async getMembersForRoom(room: string): Promise<string[] | null> {
    const id = parseGroupRoom(room);
    if (!id) return null;
    return (await this.groups.findMembers(id))?.members ?? null;
  }

  async getRoomInfo(room: string): Promise<{ name: string; members: string[] } | null> {
    const id = parseGroupRoom(room);
    if (!id) return null;
    const group = await this.groups.findNameAndMembers(id);
    return group ? { name: group.name, members: group.members } : null;
  }

  avatarPublicPath(groupId: string, version = Date.now()) {
    return `/api/groups/${groupId}/avatar?v=${version}`;
  }

  findAvatarKey(groupId: string) {
    return this.storage.bucket.findFirstKey(AVATAR_PREFIX, groupId);
  }

  async saveAvatar(groupId: string, file: UploadedFileData) {
    const key = `${AVATAR_PREFIX}${groupId}${path.extname(file.originalname).toLowerCase() || ".jpg"}`;
    await this.storage.bucket.deleteByPrefix(`${AVATAR_PREFIX}${groupId}`, key);
    await this.storage.bucket.put(key, file.buffer, file.mimetype);
  }

  removeAvatar(groupId: string) {
    return this.storage.bucket.deleteByPrefix(`${AVATAR_PREFIX}${groupId}`);
  }
}
