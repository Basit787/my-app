import { Global, Module } from "@nestjs/common";
import { ChatGraphService } from "./chat-graph.service.js";

// The LangGraph chat agent and its Postgres checkpointer
@Global()
@Module({
  providers: [ChatGraphService],
  exports: [ChatGraphService],
})
export class AgentModule {}
