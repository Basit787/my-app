import { Test, type TestingModule } from "@nestjs/testing";
import { MessagesService } from "./messages.service.js";
import { MessageRepository } from "@app/db";
import { GroupsService } from "../groups/groups.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("MessagesService", () => {
  let messagesService: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: MessageRepository, useValue: {} },
        { provide: GroupsService, useValue: {} },
      ],
    }).compile();

    messagesService = module.get<MessagesService>(MessagesService);
  });

  it("should be defined", () => {
    expect(messagesService).toBeDefined();
  });
});
