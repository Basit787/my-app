import { Test, type TestingModule } from "@nestjs/testing";
import { MessagesController } from "./messages.controller.js";
import { MessagesService } from "./messages.service.js";
import { RoomAccessService } from "../groups/room-access.service.js";
import { RealtimeService } from "@app/realtime";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("MessagesController", () => {
  let messagesController: MessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        { provide: MessagesService, useValue: {} },
        { provide: RoomAccessService, useValue: {} },
        { provide: RealtimeService, useValue: {} },
      ],
    }).compile();

    messagesController = module.get<MessagesController>(MessagesController);
  });

  it("should be defined", () => {
    expect(messagesController).toBeDefined();
  });
});
