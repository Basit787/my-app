import { Global, Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service.js";

// Expo push notifications for the mobile app
@Global()
@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
