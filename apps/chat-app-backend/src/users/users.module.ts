import { Module } from "@nestjs/common";
import { PresenceService } from "./presence.service.js";
import { UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";

@Module({
  controllers: [UsersController],
  providers: [UsersService, PresenceService],
  exports: [PresenceService],
})
export class UsersModule {}
