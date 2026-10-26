import { Test, type TestingModule } from "@nestjs/testing";
import { FilesController } from "./files.controller.js";
import { FilesService } from "./files.service.js";
import { MessagesService } from "../messages/messages.service.js";
import { RoomAccessService } from "../groups/room-access.service.js";
import { RealtimeService } from "@app/realtime";
import { NotificationsService } from "@app/notifications";
import { StorageService } from "@app/storage";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("FilesController", () => {
  let filesController: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: FilesService, useValue: {} },
        { provide: MessagesService, useValue: {} },
        { provide: RoomAccessService, useValue: {} },
        { provide: RealtimeService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
        { provide: StorageService, useValue: {} },
      ],
    }).compile();

    filesController = module.get<FilesController>(FilesController);
  });

  it("should be defined", () => {
    expect(filesController).toBeDefined();
  });
});
