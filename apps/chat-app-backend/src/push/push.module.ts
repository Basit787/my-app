import { Module } from "@nestjs/common";
import { PushController } from "./push.controller.js";

// Device token endpoints; sending lives in @app/notifications
@Module({
  controllers: [PushController],
})
export class PushModule {}
