import { appConfig, type AppConfig } from "@app/common";
import { DocumentRepository } from "@app/db";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { Document } from "@langchain/core/documents";
import { AIMessage, HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";
import { END, START, StateGraph, type LangGraphRunnableConfig } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { ChatState } from "./chat-state.js";
import { createWebSearchTool } from "./tools/create-web-search-tool.js";
import type { ChatStreamPart } from "./types/chat-stream-part.js";
import type { ChunkMetadata } from "./types/chunk-metadata.js";
import type { Source } from "./types/source.js";
import { buildSystemPrompt } from "./utils/build-system-prompt.js";
import { ensureDatabase } from "./utils/ensure-database.js";
import { historyForModel } from "./utils/history-for-model.js";
import { toolCallsOf } from "./utils/tool-calls-of.js";
import { toSource } from "./utils/to-source.js";

// Characters of history sent to the model (~4k tokens), leaving room for the reply in Ollama's 8k context
const HISTORY_CHAR_BUDGET = 16_000;
const HISTORY_CHAR_BUDGET_WITH_DOCUMENTS = 10_000;
const TOP_K = 4;
const RECURSION_LIMIT = 12;
const CHUNKS_TABLE = "document_chunks";
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;
const MAX_WEB_RESULTS = 5;
const MAX_WEB_SNIPPET_CHARS = 400;

type State = typeof ChatState.State;
type DocumentInfo = Omit<ChunkMetadata, "chunkIndex">;
type SearxngResult = { title?: string; url?: string; content?: string };

@Injectable()
export class ChatGraphService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChatGraphService.name);
  private readonly checkpointer: PostgresSaver;
  private readonly embeddings: OpenAIEmbeddings;
  private readonly splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  private store: PGVectorStore | null = null;
  private readonly tools;
  private readonly model;
  private readonly graph;

  constructor(
    @Inject(appConfig.KEY) private readonly config: AppConfig,
    private readonly documents: DocumentRepository,
  ) {
    // Own schema, so Prisma's migrations never see the checkpoint tables
    this.checkpointer = PostgresSaver.fromConnString(config.databaseUrl, { schema: "langgraph" });
    this.embeddings = new OpenAIEmbeddings({
      model: config.ollama.embedModel,
      // Required by the SDK, ignored by Ollama
      apiKey: "ollama",
      configuration: { baseURL: `${config.ollama.url}/v1` },
      encodingFormat: "float",
    });
    this.tools = [createWebSearchTool((query) => this.searchWeb(query))];
    this.model = new ChatOpenAI({
      model: config.ollama.model,
      // Required by the SDK, ignored by Ollama
      apiKey: "ollama",
      configuration: { baseURL: `${config.ollama.url}/v1` },
      temperature: 0.7,
    }).bindTools(this.tools);
    this.graph = this.buildGraph();
  }

  async onModuleInit() {
    await this.checkpointer.setup();
    this.logger.log(`Checkpointer ready; model ${this.config.ollama.model} at ${this.config.ollama.url}`);
    if (await ensureDatabase(this.config.vectorDatabaseUrl)) this.logger.log("Created the vector database");
    this.store = await PGVectorStore.initialize(this.embeddings, {
      postgresConnectionOptions: { connectionString: this.config.vectorDatabaseUrl },
      tableName: CHUNKS_TABLE,
      distanceStrategy: "cosine",
    });
    this.logger.log(`Vector store ready; embeddings ${this.config.ollama.embedModel} at ${this.config.ollama.url}`);
  }

  async onModuleDestroy() {
    await this.checkpointer.end();
    await this.store?.end();
  }

  private buildGraph() {
    const retrieve = async (state: State, config: LangGraphRunnableConfig) => {
      const conversationId = String(config.configurable?.thread_id);
      if ((await this.documents.countForConversation(conversationId)) === 0) return { sources: null };
      const question = state.messages[state.messages.length - 1].text;
      const chunks = await this.getStore().similaritySearch(question, TOP_K, { conversationId });
      this.logger.log(`Retrieved chunks. conversation=${conversationId} count=${chunks.length}`);
      return { sources: chunks.map(toSource) };
    };

    const callModel = async (state: State) => {
      const sources = state.sources ?? null;
      const budget = sources === null ? HISTORY_CHAR_BUDGET : HISTORY_CHAR_BUDGET_WITH_DOCUMENTS;
      const history = historyForModel(state.messages, budget);
      const reply = await this.model.invoke([new SystemMessage(buildSystemPrompt(sources)), ...history]);
      if (sources !== null && !reply.tool_calls?.length)
        reply.additional_kwargs = { ...reply.additional_kwargs, sources };
      return { messages: [reply] };
    };

    return new StateGraph(ChatState)
      .addNode("retrieve", retrieve)
      .addNode("model", callModel)
      .addNode("tools", new ToolNode(this.tools))
      .addEdge(START, "retrieve")
      .addEdge("retrieve", "model")
      .addConditionalEdges("model", toolsCondition, ["tools", END])
      .addEdge("tools", "model")
      .compile({ checkpointer: this.checkpointer });
  }

  async *streamReply(threadId: string, userText: string, signal: AbortSignal): AsyncGenerator<ChatStreamPart> {
    const stream = await this.graph.stream(
      { messages: [new HumanMessage(userText)] },
      {
        configurable: { thread_id: threadId },
        streamMode: ["updates", "messages"],
        recursionLimit: RECURSION_LIMIT,
        signal,
      },
    );
    for await (const [mode, payload] of stream) {
      if (mode === "updates" && "retrieve" in payload && payload.retrieve?.sources) {
        yield { type: "sources", sources: payload.retrieve.sources };
      }
      if (mode === "updates" && "model" in payload) {
        for (const call of toolCallsOf(payload.model?.messages)) yield call;
      }
      if (mode === "messages") {
        const [chunk, metadata] = payload;
        if (metadata.langgraph_node === "model" && chunk.text) yield { type: "delta", text: chunk.text };
      }
    }
  }

  // A reply stopped part-way is saved as if the model node wrote it, so the thread stays user/assistant pairs
  async savePartialReply(threadId: string, text: string, sources: Source[]): Promise<void> {
    const reply = sources.length
      ? new AIMessage({ content: text, additional_kwargs: { sources } })
      : new AIMessage(text);
    await this.graph.updateState({ configurable: { thread_id: threadId } }, { messages: [reply] }, "model");
  }

  async getMessages(threadId: string): Promise<BaseMessage[]> {
    const state = await this.graph.getState({ configurable: { thread_id: threadId } });
    return (state.values as State).messages ?? [];
  }

  deleteThread(threadId: string): Promise<void> {
    return this.checkpointer.deleteThread(threadId);
  }

  async indexDocument(info: DocumentInfo, text: string): Promise<number> {
    const started = Date.now();
    const parts = await this.splitter.splitText(text);
    const chunks = parts.map(
      (part, chunkIndex) =>
        new Document({ pageContent: part, metadata: { ...info, chunkIndex } satisfies ChunkMetadata }),
    );
    this.logger.log(`Embedding document. document=${info.documentId} chars=${text.length} chunks=${chunks.length}`);
    await this.getStore().addDocuments(chunks);
    this.logger.log(`Document indexed. document=${info.documentId} seconds=${(Date.now() - started) / 1000}`);
    return chunks.length;
  }

  async deleteDocumentChunks(documentId: string): Promise<void> {
    await this.getStore().delete({ filter: { documentId } });
  }

  async deleteConversationChunks(conversationId: string): Promise<void> {
    await this.getStore().delete({ filter: { conversationId } });
  }

  private getStore(): PGVectorStore {
    if (!this.store) throw new Error("Vector store is not initialized yet");
    return this.store;
  }

  private async searchWeb(query: string): Promise<string> {
    const url = new URL("/search", this.config.searxngUrl);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    const started = Date.now();
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) {
        const body = await response.text();
        this.logger.error(`Web search failed. status=${response.status} query="${query}" body=${body.slice(0, 500)}`);
        return `Web search failed (HTTP ${response.status}).`;
      }
      const { results = [] } = (await response.json()) as { results?: SearxngResult[] };
      const top = results.slice(0, MAX_WEB_RESULTS);
      this.logger.log(
        `Web search done. query="${query}" results=${top.length} seconds=${(Date.now() - started) / 1000}`,
      );
      if (top.length === 0) return "No web results found.";
      return top
        .map((result, index) => {
          const snippet = (result.content ?? "").slice(0, MAX_WEB_SNIPPET_CHARS);
          return `[${index + 1}] ${result.title ?? "Untitled"}\n${result.url ?? ""}\n${snippet}`;
        })
        .join("\n\n");
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(`Web search failed. query="${query}" url=${this.config.searxngUrl}: ${reason}`);
      return `Web search is unavailable: ${reason}`;
    }
  }
}
