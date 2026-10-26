import { Test, type TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service.js";
import { CallHistoryRepository, ChatGroupRepository, MessageRepository, UserPresenceRepository } from "@app/db";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("UsersService", () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: MessageRepository, useValue: {} },
        { provide: CallHistoryRepository, useValue: {} },
        { provide: ChatGroupRepository, useValue: {} },
        { provide: UserPresenceRepository, useValue: {} },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(usersService).toBeDefined();
  });
});
