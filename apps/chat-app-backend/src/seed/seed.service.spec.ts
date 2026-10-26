import { appConfig } from "@app/common";
import { CallHistoryRepository, ChatGroupRepository, MessageRepository } from "@app/db";
import { Test, type TestingModule } from "@nestjs/testing";
import { SeedService } from "./seed.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("SeedService", () => {
  let service: SeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: appConfig.KEY, useValue: {} },
        { provide: MessageRepository, useValue: {} },
        { provide: ChatGroupRepository, useValue: {} },
        { provide: CallHistoryRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
