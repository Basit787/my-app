import { Test, type TestingModule } from "@nestjs/testing";
import { FilesService } from "./files.service.js";
import { SharedFileRepository } from "@app/db";
import { StorageService } from "@app/storage";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("FilesService", () => {
  let filesService: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: SharedFileRepository, useValue: {} },
        { provide: StorageService, useValue: {} },
      ],
    }).compile();

    filesService = module.get<FilesService>(FilesService);
  });

  it("should be defined", () => {
    expect(filesService).toBeDefined();
  });
});
