import { appConfig } from "@app/common";
import { ImageRepository } from "@app/db";
import { ObjectStorageService } from "@app/storage";
import { Test, type TestingModule } from "@nestjs/testing";
import { ImagesService } from "./images.service.js";
import { PublishImageQueue } from "./queues/publish-image.queue.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("ImagesService", () => {
  let service: ImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        { provide: appConfig.KEY, useValue: { binRetentionDays: 30 } },
        { provide: ImageRepository, useValue: {} },
        { provide: ObjectStorageService, useValue: {} },
        { provide: PublishImageQueue, useValue: {} },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
