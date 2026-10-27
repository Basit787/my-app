import { Global, Module } from "@nestjs/common";
import { InvoiceModelService } from "./invoice-model.service.js";

// The local model (Ollama) for every feature
@Global()
@Module({
  providers: [InvoiceModelService],
  exports: [InvoiceModelService],
})
export class LlmModule {}
