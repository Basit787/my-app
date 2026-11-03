import { appConfig, type AppConfig } from "@app/common";
import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { createUploadOptions } from "backend-common";
import { InvoicesController } from "./invoices.controller.js";
import { InvoicesService } from "./invoices.service.js";

@Module({
  imports: [
    // One MB of headroom over MAX_FILE_SIZE_MB, so the service answers a slightly larger file with its own 400
    MulterModule.registerAsync({
      inject: [appConfig.KEY],
      useFactory: (config: AppConfig) => createUploadOptions({ maxFileSizeMb: config.maxFileSizeMb + 1 }),
    }),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
