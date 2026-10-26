import { ChatGraphService } from "@app/agent";
import { ConversationRepository } from "@app/db";
import { Test, type TestingModule } from "@nestjs/testing";
import { ConversationsService } from "./conversations.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("ConversationsService", () => {
  let service: ConversationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: ConversationRepository, useValue: {} },
        { provide: ChatGraphService, useValue: {} },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
