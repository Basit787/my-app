import { appConfig, dmRoomName, GENERAL_ROOM, groupRoomName, type AppConfig } from "@app/common";
import { CallHistoryRepository, ChatGroupRepository, MessageRepository } from "@app/db";
import { Inject, Injectable, Logger } from "@nestjs/common";

const MINUTE = 60_000;

// Demo users the seed logs in as; register them in any app first
const SEED_ACCOUNTS = [
  { name: "admin", email: "admin@chat.local", password: "Admin123!" },
  { name: "alice", email: "alice@chat.local", password: "Alice123!" },
  { name: "bob", email: "bob@chat.local", password: "Bob12345!" },
];
const SEED_GROUP_NAME = "Project team";

type SeedMessage = { from: string; text: string };

// Demo conversations for `pnpm db:seed`: #general, two DMs, a group and some call history between admin, alice and bob
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Inject(appConfig.KEY) private readonly config: AppConfig,
    private readonly messages: MessageRepository,
    private readonly groups: ChatGroupRepository,
    private readonly calls: CallHistoryRepository,
  ) {}

  async seed(): Promise<string> {
    const [admin, alice, bob] = SEED_ACCOUNTS.map((account) => account.name);
    const userIds = await this.findUserIds();

    if (await this.groups.findOne({ name: SEED_GROUP_NAME, createdBy: admin })) {
      return "Chat demo data already present";
    }

    const group = await this.groups.create({
      name: SEED_GROUP_NAME,
      description: "Planning the next release",
      members: [admin, alice, bob],
      createdBy: admin,
    });

    await this.addConversation(
      GENERAL_ROOM,
      userIds,
      [admin, alice, bob],
      [
        { from: admin, text: "Welcome to ChatWave! Say hi in #general 👋" },
        { from: alice, text: "Hi everyone!" },
        { from: bob, text: "Hello! Glad to be here." },
      ],
    );
    await this.addConversation(
      dmRoomName(alice, bob),
      userIds,
      [alice, bob],
      [
        { from: alice, text: "Are we still on for the design review tomorrow?" },
        { from: bob, text: "Yes, 10am works for me." },
        { from: alice, text: "Great, I'll share the slides tonight." },
      ],
    );
    await this.addConversation(
      dmRoomName(admin, alice),
      userIds,
      [admin, alice],
      [
        { from: admin, text: "Your access to the staging server is ready." },
        { from: alice, text: "Thanks, I'll check it out." },
      ],
    );
    await this.addConversation(
      groupRoomName(group._id.toString()),
      userIds,
      [admin, alice, bob],
      [
        { from: admin, text: "Release 2.4 is planned for Wednesday." },
        { from: bob, text: "I'll finish the CSV export fix by Thursday." },
        { from: alice, text: "Onboarding designs are ready for review." },
      ],
    );
    await this.addCallHistory(alice, bob, admin);

    return "Chat demo data created";
  }

  // Logs every demo account in on the auth service for its id
  private async findUserIds(): Promise<Map<string, string>> {
    const ids = new Map<string, string>();
    for (const { name, email, password } of SEED_ACCOUNTS) {
      const response = await fetch(`${this.config.authUrl}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error(`Login failed for ${email} (${response.status}); register this account first`);
      const { user } = (await response.json()) as { user: { id: string } };
      ids.set(name, user.id);
    }
    return ids;
  }

  // Messages a few minutes apart, already delivered to and read by the other participants
  private async addConversation(room: string, userIds: Map<string, string>, members: string[], lines: SeedMessage[]) {
    const start = Date.now() - lines.length * 5 * MINUTE;
    for (const [index, line] of lines.entries()) {
      const others = members.filter((member) => member !== line.from);
      await this.messages.create({
        room,
        user: line.from,
        userId: userIds.get(line.from),
        type: "text",
        text: line.text,
        at: new Date(start + index * 5 * MINUTE),
        deliveredTo: others,
        readBy: others,
      });
    }
    this.logger.log(`Seeded ${lines.length} messages in ${room}`);
  }

  private async addCallHistory(alice: string, bob: string, admin: string) {
    const hourAgo = new Date(Date.now() - 60 * MINUTE);
    await this.calls.create({
      caller: alice,
      callee: bob,
      callType: "video",
      status: "completed",
      startedAt: hourAgo,
      endedAt: new Date(hourAgo.getTime() + 12 * MINUTE),
      durationSeconds: 12 * 60,
    });
    await this.calls.create({
      caller: bob,
      callee: admin,
      callType: "audio",
      status: "missed",
      startedAt: new Date(Date.now() - 30 * MINUTE),
      endedAt: new Date(Date.now() - 29 * MINUTE),
    });
    this.logger.log("Seeded call history");
  }
}
