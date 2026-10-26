import { Test, type TestingModule } from "@nestjs/testing";
import { GroupsService } from "./groups.service.js";
import { ChatGroupRepository } from "@app/db";
import { StorageService } from "@app/storage";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("GroupsService", () => {
  let groupsService: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: ChatGroupRepository, useValue: {} },
        { provide: StorageService, useValue: {} },
      ],
    }).compile();

    groupsService = module.get<GroupsService>(GroupsService);
  });

  it("should be defined", () => {
    expect(groupsService).toBeDefined();
  });
});
