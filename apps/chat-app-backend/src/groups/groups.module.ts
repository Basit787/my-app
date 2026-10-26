import { createUploadOptions } from "backend-common";
import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { GroupsController } from "./groups.controller.js";
import { GroupsService } from "./groups.service.js";
import { RoomAccessService } from "./room-access.service.js";

// Group photos: images only, up to 5 MB
const MAX_AVATAR_SIZE_MB = 5;

@Module({
  imports: [MulterModule.register(createUploadOptions({ maxFileSizeMb: MAX_AVATAR_SIZE_MB, imagesOnly: true }))],
  controllers: [GroupsController],
  providers: [GroupsService, RoomAccessService],
  exports: [GroupsService, RoomAccessService],
})
export class GroupsModule {}
