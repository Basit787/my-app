import { appConfig, type AppConfig } from "@app/common";
import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { createUploadOptions } from "backend-common";
import { ImagesController } from "./images.controller.js";
import { ImagesService } from "./images.service.js";
import { PublishImageQueue } from "./queues/publish-image.queue.js";
import { PurgeBinQueue } from "./queues/purge-bin.queue.js";

@Module({
  imports: [
    // Images only, up to MAX_FILE_SIZE_MB
    MulterModule.registerAsync({
      inject: [appConfig.KEY],
      useFactory: (config: AppConfig) => createUploadOptions({ maxFileSizeMb: config.maxFileSizeMb, imagesOnly: true }),
    }),
  ],
  controllers: [ImagesController],
  providers: [ImagesService, PublishImageQueue, PurgeBinQueue],
})
export class ImagesModule {}
