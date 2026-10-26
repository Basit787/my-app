import { appConfig, type AppConfig } from "@app/common";
import { ImageRepository } from "@app/db";
import { ObjectStorageService } from "@app/storage";
import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { createJobQueue, type JobQueue } from "backend-common";
import { addDays } from "../utils/add-days.js";

const BATCH_SIZE = 200;

// Deletes images binned more than BIN_RETENTION_DAYS ago from the bucket, then their rows, on BIN_PURGE_CRON
@Injectable()
export class PurgeBinQueue implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PurgeBinQueue.name);
  private readonly queue: JobQueue<Record<string, never>>;

  constructor(
    @Inject(appConfig.KEY) private readonly config: AppConfig,
    private readonly images: ImageRepository,
    private readonly storage: ObjectStorageService,
  ) {
    this.queue = createJobQueue<Record<string, never>>("purge-bin", () => this.purge(), { redisUrl: config.redisUrl });
  }

  async onModuleInit() {
    this.queue.start();
    await this.queue.every("purge-bin", this.config.binPurgeCron, {});
  }

  async onModuleDestroy() {
    await this.queue.close();
  }

  private async purge() {
    const cutoff = addDays(new Date(), -this.config.binRetentionDays);
    let purged = 0;
    for (;;) {
      const expired = await this.images.findBinnedBefore(cutoff, BATCH_SIZE);
      if (!expired.length) break;
      await Promise.all(expired.map((image) => this.storage.bucket.delete(image.storedName)));
      await this.images.deleteMany(expired.map((image) => image.id));
      purged += expired.length;
    }
    if (purged) this.logger.log(`Bin purged. images=${purged}`);
    return { purged };
  }
}
