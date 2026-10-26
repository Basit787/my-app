import { Test, type TestingModule } from "@nestjs/testing";
import { appConfig } from "@app/common";
import { DocumentRepository } from "@app/db";
import { ObjectStorageService } from "@app/storage";
import { DocumentEventsService } from "./document-events.service.js";
import { DocumentsService } from "./documents.service.js";
import { SummarizerService } from "./summarizer.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("DocumentsService", () => {
  let instance: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: appConfig.KEY, useValue: { maxFileSizeMb: 1 } },
        { provide: DocumentRepository, useValue: {} },
        { provide: ObjectStorageService, useValue: {} },
        { provide: DocumentEventsService, useValue: {} },
        { provide: SummarizerService, useValue: {} },
      ],
    }).compile();

    instance = module.get<DocumentsService>(DocumentsService);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
