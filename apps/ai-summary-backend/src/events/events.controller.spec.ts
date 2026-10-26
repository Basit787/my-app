import { Test, type TestingModule } from "@nestjs/testing";
import { EventsController } from "./events.controller.js";
import { EventsService } from "./events.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("EventsController", () => {
  let instance: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: {} }],
    }).compile();

    instance = module.get<EventsController>(EventsController);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
