import { Test, type TestingModule } from "@nestjs/testing";
import { DocumentRepository } from "@app/db";
import { SummaryModelService } from "@app/llm";
import { ObjectStorageService } from "@app/storage";
import { DocumentEventsService } from "./document-events.service.js";
import { SummarizerService } from "./summarizer.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("SummarizerService", () => {
  let instance: SummarizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummarizerService,
        { provide: DocumentRepository, useValue: {} },
        { provide: ObjectStorageService, useValue: {} },
        { provide: SummaryModelService, useValue: {} },
        { provide: DocumentEventsService, useValue: {} },
      ],
    }).compile();

    instance = module.get<SummarizerService>(SummarizerService);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
