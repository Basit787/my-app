import { Test, type TestingModule } from "@nestjs/testing";
import { EventBrokerService } from "@app/events";
import { EventsService } from "./events.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("EventsService", () => {
  let instance: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService, { provide: EventBrokerService, useValue: {} }],
    }).compile();

    instance = module.get<EventsService>(EventsService);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
