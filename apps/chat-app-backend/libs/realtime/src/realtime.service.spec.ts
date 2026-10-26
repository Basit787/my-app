import { Test, type TestingModule } from "@nestjs/testing";
import { RealtimeService } from "./realtime.service.js";
import { ChatGroupRepository } from "@app/db";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("RealtimeService", () => {
  let realtimeService: RealtimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealtimeService, { provide: ChatGroupRepository, useValue: {} }],
    }).compile();

    realtimeService = module.get<RealtimeService>(RealtimeService);
  });

  it("should be defined", () => {
    expect(realtimeService).toBeDefined();
  });
});
