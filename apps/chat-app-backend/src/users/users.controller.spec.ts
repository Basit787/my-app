import { Test, type TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";
import { PresenceService } from "./presence.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("UsersController", () => {
  let usersController: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: {} },
        { provide: PresenceService, useValue: {} },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
  });

  it("should be defined", () => {
    expect(usersController).toBeDefined();
  });
});
