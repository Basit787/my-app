import { appConfig, type AppConfig } from "@app/common";
import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { createUploadOptions } from "backend-common";
import { ExtractorService } from "./extractor.service.js";
import { InvoiceEventsService } from "./invoice-events.service.js";
import { InvoicesController } from "./invoices.controller.js";
import { InvoicesService } from "./invoices.service.js";
import { OriginalEditorService } from "./original-editor.service.js";
import { PagePreviewService } from "./page-preview.service.js";

@Module({
  imports: [
    // One MB of headroom over MAX_FILE_SIZE_MB, so the service answers a slightly larger file with its own 400
    MulterModule.registerAsync({
      inject: [appConfig.KEY],
      useFactory: (config: AppConfig) => createUploadOptions({ maxFileSizeMb: config.maxFileSizeMb + 1 }),
    }),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoiceEventsService, ExtractorService, PagePreviewService, OriginalEditorService],
  exports: [ExtractorService],
})
export class InvoicesModule {}
