import { Global, Module } from "@nestjs/common";
import { RealtimeService } from "./realtime.service.js";

// Socket.IO fan-out shared by every gateway and controller
@Global()
@Module({
  providers: [RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
