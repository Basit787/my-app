import { Test, type TestingModule } from "@nestjs/testing";
import { DocumentsController } from "./documents.controller.js";
import { DocumentsService } from "./documents.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("DocumentsController", () => {
  let instance: DocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [{ provide: DocumentsService, useValue: {} }],
    }).compile();

    instance = module.get<DocumentsController>(DocumentsController);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
