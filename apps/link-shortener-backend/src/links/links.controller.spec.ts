import { Test, type TestingModule } from "@nestjs/testing";
import { LinksController } from "./links.controller.js";
import { LinksService } from "./links.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("LinksController", () => {
  let instance: LinksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinksController],
      providers: [{ provide: LinksService, useValue: {} }],
    }).compile();

    instance = module.get<LinksController>(LinksController);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
