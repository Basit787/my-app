import { Test, type TestingModule } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("AuthController", () => {
  let instance: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([])],
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: {} }],
    }).compile();

    instance = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
