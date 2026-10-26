import { Test, type TestingModule } from "@nestjs/testing";
import { ChatGateway } from "./chat.gateway.js";
import { RealtimeService } from "@app/realtime";
import { PresenceService } from "../users/presence.service.js";
import { MessagesService } from "../messages/messages.service.js";
import { GroupsService } from "../groups/groups.service.js";
import { GroupCallService } from "../calls/group-call.service.js";
import { RoomAccessService } from "../groups/room-access.service.js";
import { NotificationsService } from "@app/notifications";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("ChatGateway", () => {
  let chatGateway: ChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: RealtimeService, useValue: {} },
        { provide: PresenceService, useValue: {} },
        { provide: MessagesService, useValue: {} },
        { provide: GroupsService, useValue: {} },
        { provide: GroupCallService, useValue: {} },
        { provide: RoomAccessService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
      ],
    }).compile();

    chatGateway = module.get<ChatGateway>(ChatGateway);
  });

  it("should be defined", () => {
    expect(chatGateway).toBeDefined();
  });
});
