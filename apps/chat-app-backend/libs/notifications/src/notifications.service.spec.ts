import { Test, type TestingModule } from "@nestjs/testing";
import { NotificationsService } from "./notifications.service.js";
import { PushTokenRepository, ChatGroupRepository } from "@app/db";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("NotificationsService", () => {
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PushTokenRepository, useValue: {} },
        { provide: ChatGroupRepository, useValue: {} },
      ],
    }).compile();

    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  it("should be defined", () => {
    expect(notificationsService).toBeDefined();
  });
});
