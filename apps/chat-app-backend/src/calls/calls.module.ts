import { Module } from "@nestjs/common";
import { GroupsModule } from "../groups/groups.module.js";
import { CallSessionService } from "./call-session.service.js";
import { CallsController } from "./calls.controller.js";
import { CallsGateway } from "./calls.gateway.js";
import { CallsService } from "./calls.service.js";
import { GroupCallService } from "./group-call.service.js";

@Module({
  imports: [GroupsModule],
  controllers: [CallsController],
  providers: [CallsService, CallSessionService, GroupCallService, CallsGateway],
  exports: [GroupCallService],
})
export class CallsModule {}
