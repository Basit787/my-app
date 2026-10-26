import { Test, type TestingModule } from "@nestjs/testing";
import { GroupsController } from "./groups.controller.js";
import { GroupsService } from "./groups.service.js";
import { StorageService } from "@app/storage";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("GroupsController", () => {
  let groupsController: GroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        { provide: GroupsService, useValue: {} },
        { provide: StorageService, useValue: {} },
      ],
    }).compile();

    groupsController = module.get<GroupsController>(GroupsController);
  });

  it("should be defined", () => {
    expect(groupsController).toBeDefined();
  });
});
