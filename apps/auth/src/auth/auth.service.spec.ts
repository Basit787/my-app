import { Test, type TestingModule } from "@nestjs/testing";
import { appConfig } from "@app/common";
import { UserRepository } from "@app/db";
import { AuthService } from "./auth.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("AuthService", () => {
  let instance: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: {} },
        { provide: appConfig.KEY, useValue: { tokenTtlSeconds: 60 } },
      ],
    }).compile();

    instance = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
