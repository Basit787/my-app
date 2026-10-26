import { Test, type TestingModule } from "@nestjs/testing";
import { DbService } from "./db.service.js";
import { getConnectionToken } from "@nestjs/mongoose";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("DbService", () => {
  let dbService: DbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbService, { provide: getConnectionToken(), useValue: {} }],
    }).compile();

    dbService = module.get<DbService>(DbService);
  });

  it("should be defined", () => {
    expect(dbService).toBeDefined();
  });
});
