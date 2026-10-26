import { Test, type TestingModule } from "@nestjs/testing";
import { LinksService } from "./links.service.js";
import { ShortLinksController } from "./short-links.controller.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("ShortLinksController", () => {
  let instance: ShortLinksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortLinksController],
      providers: [{ provide: LinksService, useValue: {} }],
    }).compile();

    instance = module.get<ShortLinksController>(ShortLinksController);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
