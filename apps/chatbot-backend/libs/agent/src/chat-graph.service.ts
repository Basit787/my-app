import { appConfig, type AppConfig } from "@app/common";
import { AIMessage, HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { ChatOpenAI } from "@langchain/openai";
import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { SYSTEM_PROMPT } from "./system-prompt.js";
import { recentMessages } from "./utils/recent-messages.js";

// Characters of history sent to the model (~4k tokens), leaving room for the reply in Ollama's 8k context
const HISTORY_CHAR_BUDGET = 16_000;

// LangGraph chat agent; every conversation is a thread whose messages PostgresSaver stores in Postgres
@Injectable()
export class ChatGraphService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChatGraphService.name);
  private readonly checkpointer: PostgresSaver;
  private readonly model: ChatOpenAI;
  private readonly graph;

  constructor(@Inject(appConfig.KEY) private readonly config: AppConfig) {
    // Own schema, so Prisma's migrations never see the checkpoint tables
    this.checkpointer = PostgresSaver.fromConnString(config.databaseUrl, { schema: "langgraph" });
    this.model = new ChatOpenAI({
      model: config.ollama.model,
      // Required by the SDK, ignored by Ollama
      apiKey: "ollama",
      configuration: { baseURL: `${config.ollama.url}/v1` },
      temperature: 0.7,
    });
    this.graph = this.buildGraph();
  }

  // Creates the checkpoint tables on first start
  async onModuleInit() {
    await this.checkpointer.setup();
    this.logger.log(`Checkpointer ready; model ${this.config.ollama.model} at ${this.config.ollama.url}`);
  }

  async onModuleDestroy() {
    await this.checkpointer.end();
  }

  // START -> model -> END; the checkpointer adds the stored history before the model runs
  private buildGraph() {
    const callModel = async (state: typeof MessagesAnnotation.State) => {
      const history = recentMessages(state.messages, HISTORY_CHAR_BUDGET);
      const reply = await this.model.invoke([new SystemMessage(SYSTEM_PROMPT), ...history]);
      return { messages: [reply] };
    };

    return new StateGraph(MessagesAnnotation)
      .addNode("model", callModel)
      .addEdge(START, "model")
      .addEdge("model", END)
      .compile({ checkpointer: this.checkpointer });
  }

  // Yields the reply text as the model writes it; the user message and the full reply are saved to the thread
  async *streamReply(threadId: string, userText: string, signal: AbortSignal): AsyncGenerator<string> {
    const stream = await this.graph.stream(
      { messages: [new HumanMessage(userText)] },
      { configurable: { thread_id: threadId }, streamMode: "messages", signal },
    );
    for await (const [chunk] of stream) {
      if (chunk.text) yield chunk.text;
    }
  }

  // A reply stopped part-way is saved as if the model node wrote it, so the thread stays user/assistant pairs
  savePartialReply(threadId: string, text: string): Promise<void> {
    return this.appendMessages(threadId, [new AIMessage(text)]);
  }

  // Adds finished messages to a thread without calling the model (stopped replies)
  async appendMessages(threadId: string, messages: BaseMessage[]): Promise<void> {
    await this.graph.updateState({ configurable: { thread_id: threadId } }, { messages }, "model");
  }

  async getMessages(threadId: string): Promise<BaseMessage[]> {
    const state = await this.graph.getState({ configurable: { thread_id: threadId } });
    return (state.values as typeof MessagesAnnotation.State).messages ?? [];
  }

  deleteThread(threadId: string): Promise<void> {
    return this.checkpointer.deleteThread(threadId);
  }
}
