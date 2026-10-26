import { parseDmRoom, type ContactDto } from "@app/common";
import { CallHistoryRepository, ChatGroupRepository, MessageRepository, UserPresenceRepository } from "@app/db";
import { Injectable } from "@nestjs/common";

// Contacts: people the user has talked to, called or shares a group with, plus everyone who has used the chat
@Injectable()
export class UsersService {
  constructor(
    private readonly messages: MessageRepository,
    private readonly calls: CallHistoryRepository,
    private readonly groups: ChatGroupRepository,
    private readonly presence: UserPresenceRepository,
  ) {}

  async getContacts(username: string): Promise<ContactDto[]> {
    const peers = new Set<string>();
    const [dmRooms, calls, groups, chatUsers] = await Promise.all([
      this.messages.findDmRooms(),
      this.calls.findParticipantsFor(username),
      this.groups.findMemberLists(username),
      this.presence.findAllUsernames(),
    ]);

    for (const { room } of dmRooms) {
      const participants = parseDmRoom(room);
      if (participants?.includes(username)) peers.add(participants[0] === username ? participants[1] : participants[0]);
    }
    for (const call of calls) peers.add(call.caller === username ? call.callee : call.caller);
    for (const group of groups) group.members.forEach((member) => peers.add(member));
    for (const name of chatUsers) peers.add(name);

    peers.delete(username);
    return [...peers].sort((a, b) => a.localeCompare(b)).map((name) => ({ name, image: "" }));
  }
}
