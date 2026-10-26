import { appConfig, type AppConfig } from "@app/common";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { PROMPTS } from "./prompts.js";
import { splitIntoChunks } from "./utils/split-into-chunks.js";

// Characters per model call (~3k tokens, within OLLAMA_CONTEXT_LENGTH); longer text is summarized in parts
const CHUNK_SIZE = 12_000;

// Local model served by Ollama through its OpenAI-compatible API
@Injectable()
export class SummaryModelService {
  private readonly logger = new Logger(SummaryModelService.name);
  private readonly model: ChatOpenAI;

  constructor(@Inject(appConfig.KEY) private readonly config: AppConfig) {
    this.model = new ChatOpenAI({
      model: config.ollama.model,
      // Required by the SDK, ignored by Ollama
      apiKey: "ollama",
      configuration: { baseURL: `${config.ollama.url}/v1` },
      temperature: 0.3,
      timeout: 900_000,
      maxRetries: 1,
    });
  }

  async generateSummary(text: string): Promise<string> {
    if (text.length <= CHUNK_SIZE) return this.ask(PROMPTS.summary, text);

    const chunks = splitIntoChunks(text, CHUNK_SIZE);
    const partialSummaries: string[] = [];
    for (const [index, chunk] of chunks.entries()) {
      this.logger.log(`Summarizing part ${index + 1} of ${chunks.length}.`);
      partialSummaries.push(await this.ask(PROMPTS.summary, chunk));
    }

    const combined = partialSummaries.join("\n\n");
    if (combined.length <= CHUNK_SIZE) {
      this.logger.log(`Combining ${partialSummaries.length} partial summaries.`);
      return this.ask(PROMPTS.combine, combined);
    }

    // Very long documents: the partial summaries themselves are summarized again
    this.logger.log(`Partial summaries are still long (${combined.length} chars); summarizing them again.`);
    return this.generateSummary(combined);
  }

  private async ask(instructions: string, text: string): Promise<string> {
    const started = Date.now();
    try {
      const reply = await this.model.invoke([new SystemMessage(instructions), new HumanMessage(text)]);
      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      this.logger.log(
        `Model answered. model=${this.config.ollama.model} input_chars=${text.length} seconds=${seconds}`,
      );
      return reply.text.trim();
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
