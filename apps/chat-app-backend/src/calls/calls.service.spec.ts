import { Test, type TestingModule } from "@nestjs/testing";
import { CallsService } from "./calls.service.js";
import { CallHistoryRepository } from "@app/db";
import { appConfig } from "@app/common";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("CallsService", () => {
  let callsService: CallsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallsService,
        { provide: CallHistoryRepository, useValue: {} },
        { provide: appConfig.KEY, useValue: {} },
      ],
    }).compile();

    callsService = module.get<CallsService>(CallsService);
  });

  it("should be defined", () => {
    expect(callsService).toBeDefined();
  });
});
