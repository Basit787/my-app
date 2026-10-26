import { Test, type TestingModule } from "@nestjs/testing";
import { EventBrokerService } from "@app/events";
import { DocumentEventsService } from "./document-events.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("DocumentEventsService", () => {
  let instance: DocumentEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentEventsService, { provide: EventBrokerService, useValue: {} }],
    }).compile();

    instance = module.get<DocumentEventsService>(DocumentEventsService);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
