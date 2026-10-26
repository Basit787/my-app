import { createUploadOptions } from "backend-common";
import { appConfig, type AppConfig } from "@app/common";
import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { GroupsModule } from "../groups/groups.module.js";
import { MessagesModule } from "../messages/messages.module.js";
import { FilesController } from "./files.controller.js";
import { FilesService } from "./files.service.js";

@Module({
  imports: [
    // Attachments: any type, up to MAX_FILE_SIZE_MB
    MulterModule.registerAsync({
      inject: [appConfig.KEY],
      useFactory: (config: AppConfig) => createUploadOptions({ maxFileSizeMb: config.maxFileSizeMb }),
    }),
    GroupsModule,
    MessagesModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
