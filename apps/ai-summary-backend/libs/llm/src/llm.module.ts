import { Global, Module } from "@nestjs/common";
import { SummaryModelService } from "./summary-model.service.js";

// The local model (Ollama) for every feature
@Global()
@Module({
  providers: [SummaryModelService],
  exports: [SummaryModelService],
})
export class LlmModule {}
