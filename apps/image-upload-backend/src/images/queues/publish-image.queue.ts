import { appConfig, type AppConfig } from "@app/common";
import { ImageRepository } from "@app/db";
import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { createJobQueue, type JobQueue } from "backend-common";
import type { PublishImageJob } from "../types/publish-image-job.js";

// A scheduled upload reaches its time and shows up in the gallery
@Injectable()
export class PublishImageQueue implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PublishImageQueue.name);
  private readonly queue: JobQueue<PublishImageJob>;

  constructor(
    @Inject(appConfig.KEY) config: AppConfig,
    private readonly images: ImageRepository,
  ) {
    this.queue = createJobQueue<PublishImageJob>("publish-image", (job) => this.publish(job.data.imageId), {
      redisUrl: config.redisUrl,
      concurrency: 5,
    });
  }

  onModuleInit() {
    this.queue.start();
  }

  async onModuleDestroy() {
    await this.queue.close();
  }

  // One job per image (job id = image id), run at `date`
  async scheduleAt(date: Date, imageId: string): Promise<void> {
    await this.queue.addAt(date, { imageId }, { jobId: imageId });
  }

  private async publish(imageId: string) {
    await this.images.publish(imageId);
    this.logger.log(`Scheduled image published. id=${imageId}`);
  }
}
