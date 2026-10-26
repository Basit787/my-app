import { Test, type TestingModule } from "@nestjs/testing";
import { LinkRepository } from "@app/db";
import { LinksService } from "./links.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("LinksService", () => {
  let instance: LinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinksService, { provide: LinkRepository, useValue: {} }],
    }).compile();

    instance = module.get<LinksService>(LinksService);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
