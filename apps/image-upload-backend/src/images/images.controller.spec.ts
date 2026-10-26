import { Test, type TestingModule } from "@nestjs/testing";
import { ImagesController } from "./images.controller.js";
import { ImagesService } from "./images.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("ImagesController", () => {
  let controller: ImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [{ provide: ImagesService, useValue: {} }],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
