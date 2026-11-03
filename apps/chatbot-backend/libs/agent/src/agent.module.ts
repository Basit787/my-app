import { Global, Module } from "@nestjs/common";
import { ChatGraphService } from "./chat-graph.service.js";

@Global()
@Module({
  providers: [ChatGraphService],
  exports: [ChatGraphService],
})
export class AgentModule {}
