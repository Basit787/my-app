import { Test, type TestingModule } from "@nestjs/testing";
import { StorageService } from "./storage.service.js";
import { appConfig } from "@app/common";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("StorageService", () => {
  let storageService: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: appConfig.KEY,
          useValue: {
            minio: {
              endpoint: "http://localhost:9000",
              region: "us-east-1",
              accessKey: "test",
              secretKey: "test",
              bucket: "test",
            },
          },
        },
      ],
    }).compile();

    storageService = module.get<StorageService>(StorageService);
  });

  it("should be defined", () => {
    expect(storageService).toBeDefined();
  });
});
