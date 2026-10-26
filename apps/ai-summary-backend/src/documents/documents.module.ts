import { appConfig, type AppConfig } from "@app/common";
import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { createUploadOptions } from "backend-common";
import { DocumentEventsService } from "./document-events.service.js";
import { DocumentsController } from "./documents.controller.js";
import { DocumentsService } from "./documents.service.js";
import { SummarizerService } from "./summarizer.service.js";

@Module({
  imports: [
    // One MB of headroom over MAX_FILE_SIZE_MB, so the service answers a slightly larger file with its own 400
    MulterModule.registerAsync({
      inject: [appConfig.KEY],
      useFactory: (config: AppConfig) => createUploadOptions({ maxFileSizeMb: config.maxFileSizeMb + 1 }),
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentEventsService, SummarizerService],
  exports: [SummarizerService],
})
export class DocumentsModule {}
