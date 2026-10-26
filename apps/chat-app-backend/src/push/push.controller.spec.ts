import { Test, type TestingModule } from "@nestjs/testing";
import { PushController } from "./push.controller.js";
import { NotificationsService } from "@app/notifications";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("PushController", () => {
  let pushController: PushController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushController],
      providers: [{ provide: NotificationsService, useValue: {} }],
    }).compile();

    pushController = module.get<PushController>(PushController);
  });

  it("should be defined", () => {
    expect(pushController).toBeDefined();
  });
});
