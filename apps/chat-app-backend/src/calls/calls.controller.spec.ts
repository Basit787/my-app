import { Test, type TestingModule } from "@nestjs/testing";
import { CallsController } from "./calls.controller.js";
import { CallsService } from "./calls.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("CallsController", () => {
  let callsController: CallsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallsController],
      providers: [{ provide: CallsService, useValue: {} }],
    }).compile();

    callsController = module.get<CallsController>(CallsController);
  });

  it("should be defined", () => {
    expect(callsController).toBeDefined();
  });
});
