import { ChatGraphService } from "@app/agent";
import { ConversationRepository, type Conversation } from "@app/db";
import { Injectable, Logger } from "@nestjs/common";
import { PassThrough } from "node:stream";
import type { ConversationDetailDto } from "./dto/conversation-detail.dto.js";
import type { ConversationDto } from "./dto/conversation.dto.js";
import type { ChatStreamEvent } from "./types/chat-stream-event.js";
import { titleFromMessage } from "./utils/title-from-message.js";
import { toChatMessageDto } from "./utils/to-chat-message-dto.js";
import { toConversationDto } from "./utils/to-conversation-dto.js";

const DEFAULT_TITLE = "New chat";

// Conversations (Prisma) plus their messages (LangGraph thread with the same id); null means not found for this user
@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    private readonly conversations: ConversationRepository,
    private readonly chatGraph: ChatGraphService,
  ) {}

  async list(userId: string): Promise<ConversationDto[]> {
    const conversations = await this.conversations.listForUser(userId);
    return conversations.map(toConversationDto);
  }

  async create(userId: string): Promise<ConversationDto> {
    return toConversationDto(await this.conversations.create(userId));
  }

  async getDetail(id: string, userId: string): Promise<ConversationDetailDto | null> {
    const conversation = await this.conversations.findForUser(id, userId);
    if (!conversation) return null;
    const messages = await this.chatGraph.getMessages(id);
    return { conversation: toConversationDto(conversation), messages: messages.map(toChatMessageDto) };
  }

  async rename(id: string, userId: string, title: string): Promise<ConversationDto | null> {
    const conversation = await this.conversations.findForUser(id, userId);
    if (!conversation) return null;
    return toConversationDto(await this.conversations.rename(id, title));
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const conversation = await this.conversations.findForUser(id, userId);
    if (!conversation) return false;
    await this.chatGraph.deleteThread(id);
    await this.conversations.delete(id);
    return true;
  }

  // Returns the NDJSON reply stream right away; the reply keeps generating (and is saved) even if the client leaves
  async startReply(id: string, userId: string, content: string): Promise<PassThrough | null> {
    const conversation = await this.conversations.findForUser(id, userId);
    if (!conversation) return null;
    const output = new PassThrough();
    void this.writeReply(conversation, content, output);
    return output;
  }

  private async writeReply(conversation: Conversation, content: string, output: PassThrough) {
    const send = (event: ChatStreamEvent) => output.write(`${JSON.stringify(event)}\n`);
    const started = Date.now();
    // Nest destroys the stream when the client disconnects (Stop button); that stops the model too
    const stop = new AbortController();
    output.on("close", () => stop.abort());
    let replyText = "";
    try {
      // The first message names the chat; the client shows it before the reply starts
      if (conversation.title === DEFAULT_TITLE) {
        const renamed = await this.conversations.rename(conversation.id, titleFromMessage(content));
        send({ type: "conversation", conversation: toConversationDto(renamed) });
      }

      this.logger.log(`Generating reply. conversation=${conversation.id} chars=${content.length}`);
      for await (const text of this.chatGraph.streamReply(conversation.id, content, stop.signal)) {
        replyText += text;
        send({ type: "delta", text });
      }

      const messages = await this.chatGraph.getMessages(conversation.id);
      const reply = toChatMessageDto(messages[messages.length - 1], messages.length - 1);
      const updated = await this.conversations.touch(conversation.id);
      send({ type: "done", message: reply, conversation: toConversationDto(updated) });
      this.logger.log(`Reply saved. conversation=${conversation.id} seconds=${(Date.now() - started) / 1000}`);
    } catch (error) {
      if (stop.signal.aborted) {
        await this.savePartialReply(conversation.id, replyText);
        return;
      }
      // The model's own message (e.g. "model 'x' not found") is the fastest way to the cause
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Reply failed. conversation=${conversation.id}: ${reason}`,
        error instanceof Error ? error.stack : "",
      );
      // Ollama kills the model when Docker runs out of memory; say so instead of a bare 500
      const hint = reason.includes("signal: killed")
        ? " (Ollama ran out of memory: give Docker Desktop more memory or set a smaller OLLAMA_MODEL)"
        : "";
      send({ type: "error", error: `The model could not answer: ${reason}${hint}` });
    } finally {
      output.end();
    }
  }

  // Keeps what the user already saw, like ChatGPT does after Stop
  private async savePartialReply(conversationId: string, replyText: string) {
    this.logger.log(`Reply stopped by the client. conversation=${conversationId} chars=${replyText.length}`);
    try {
      if (replyText) await this.chatGraph.savePartialReply(conversationId, replyText);
      await this.conversations.touch(conversationId);
    } catch (error) {
      this.logger.error(`Could not save the stopped reply. conversation=${conversationId}`, String(error));
    }
  }
}
