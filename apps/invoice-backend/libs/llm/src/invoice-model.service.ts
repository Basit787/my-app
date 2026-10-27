import { appConfig, type AppConfig } from "@app/common";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { PROMPTS } from "./prompts.js";
import { fitForModel } from "./utils/fit-for-model.js";
import { parseJsonReply } from "./utils/parse-json-reply.js";

// Local model served by Ollama through its OpenAI-compatible API
@Injectable()
export class InvoiceModelService {
  private readonly logger = new Logger(InvoiceModelService.name);
  private readonly model: ChatOpenAI;

  constructor(@Inject(appConfig.KEY) private readonly config: AppConfig) {
    this.model = new ChatOpenAI({
      model: config.ollama.model,
      // Required by the SDK, ignored by Ollama
      apiKey: "ollama",
      configuration: { baseURL: `${config.ollama.url}/v1` },
      // Extraction, not writing: the same text should always give the same fields
      temperature: 0,
      timeout: 900_000,
      maxRetries: 1,
    });
  }

  // The invoice fields as the model's raw JSON object; the caller validates every value
  async extractFields(text: string): Promise<Record<string, unknown>> {
    const input = fitForModel(text);
    const started = Date.now();
    try {
      const reply = await this.model.invoke([new SystemMessage(PROMPTS.invoice), new HumanMessage(input)]);
      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      this.logger.log(
        `Model answered. model=${this.config.ollama.model} input_chars=${input.length} seconds=${seconds}`,
      );
      return parseJsonReply(reply.text);
    } catch (error) {
      // Ollama's own message, e.g. "model 'x' not found" or an out-of-memory error
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Model call failed. model=${this.config.ollama.model} url=${this.config.ollama.url}: ${message}`,
      );
      throw error;
    }
  }
}
