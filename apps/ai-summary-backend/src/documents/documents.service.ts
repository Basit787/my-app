import { appConfig, type AppConfig, type UploadedFileData } from "@app/common";
import { DocumentRepository, type Document } from "@app/db";
import { EventBrokerService } from "@app/events";
import { SummaryModelService } from "@app/llm";
import { ObjectStorageService } from "@app/storage";
import { BadRequestException, ConflictException, Inject, Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { DocumentDto } from "./dto/document.dto.js";
import type { DocumentEvent } from "./types/document-event.js";
import { readText } from "./utils/read-text.js";
import { toDocumentDto } from "./utils/to-document-dto.js";

// The signed-in user's documents; null means not found for this user. Summaries run in the background,
// and every change is pushed to the owner's open event streams.
@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @Inject(appConfig.KEY) private readonly config: AppConfig,
    private readonly documents: DocumentRepository,
    private readonly storage: ObjectStorageService,
    private readonly broker: EventBrokerService,
    private readonly model: SummaryModelService,
  ) {}

  async list(userId: string): Promise<DocumentDto[]> {
    const documents = await this.documents.listForUser(userId);
    return documents.map(toDocumentDto);
  }

  async get(id: string, userId: string): Promise<DocumentDto | null> {
    const document = await this.documents.findForUser(id, userId);
    return document ? toDocumentDto(document) : null;
  }

  async upload(userId: string, file: UploadedFileData | undefined): Promise<DocumentDto> {
    if (!file) throw new BadRequestException({ error: "Invalid request", details: { file: ["No file uploaded"] } });
    if (!file.originalname.toLowerCase().endsWith(".txt")) {
      throw new BadRequestException("Only .txt files are allowed.");
    }
    if (file.size > this.config.maxFileSizeMb * 1024 * 1024) {
      throw new BadRequestException(`Maximum file size is ${this.config.maxFileSizeMb} MB.`);
    }
    const text = this.decodeUtf8(file.buffer);
    if (!text.trim()) throw new BadRequestException("The file is empty.");

    const storageKey = `${userId}/${randomUUID()}.txt`;
    await this.storage.bucket.put(storageKey, file.buffer, "text/plain; charset=utf-8");
    const document = await this.documents.create({
      userId,
      filename: file.originalname,
      storageKey,
      size: file.size,
    });
    this.logger.log(`Document uploaded. id=${document.id} filename=${document.filename}`);
    await this.publishUpdated(document);
    void this.summarize(document.id);
    return toDocumentDto(document);
  }

  // Only a failed summary can be requested again
  async retrySummary(id: string, userId: string): Promise<DocumentDto | null> {
    const current = await this.documents.findForUser(id, userId);
    if (!current) return null;
    if (current.status !== "FAILED") throw new ConflictException("Only failed documents can be summarized again.");

    const document = await this.documents.updateStatus(current.id, "UPLOADED");
    await this.publishUpdated(document);
    void this.summarize(document.id);
    return toDocumentDto(document);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const document = await this.documents.findForUser(id, userId);
    if (!document) return false;
    await this.storage.bucket.delete(document.storageKey);
    await this.documents.delete(document.id);
    this.logger.log(`Document deleted. id=${document.id}`);
    await this.publishDeleted(userId, document.id);
    return true;
  }

  // Documents left unfinished by a restart are summarized again, one after another
  async resumePending(): Promise<void> {
    const documentIds = await this.documents.pendingIds();
    this.logger.log(`Resuming ${documentIds.length} unfinished documents.`);
    for (const documentId of documentIds) {
      await this.summarize(documentId);
    }
  }

  // Background summary; never throws: a failure marks the document FAILED
  private async summarize(documentId: string): Promise<void> {
    try {
      this.logger.log(`Step 1/3: marking document as processing. id=${documentId}`);
      let document = await this.documents.updateStatus(documentId, "PROCESSING");
      await this.publishUpdated(document);

      this.logger.log(`Step 2/3: downloading text. id=${documentId} key=${document.storageKey}`);
      const object = await this.storage.bucket.getObject(document.storageKey);
      if (!object) throw new Error(`Object ${document.storageKey} is missing from the bucket`);
      const text = await readText(object.stream);

      this.logger.log(`Step 3/3: generating summary. id=${documentId} chars=${text.length}`);
      const summary = await this.model.generateSummary(text);

      document = await this.documents.updateSummary(documentId, summary);
      await this.publishUpdated(document);
      this.logger.log(`Document summarized. id=${documentId} summary_chars=${summary.length}`);
    } catch (error) {
      const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
      this.logger.error(`Document summarization failed. id=${documentId}: ${message}`);
      await this.markFailed(documentId);
    }
  }

  private async markFailed(documentId: string) {
    try {
      const document = await this.documents.updateStatus(documentId, "FAILED");
      await this.publishUpdated(document);
    } catch {
      // Usually the document was deleted while it was being summarized
      this.logger.warn(`Could not mark document as failed. id=${documentId}`);
    }
  }

  // Same JSON as the REST replies, so the client can drop it straight into its list
  private async publishUpdated(document: Document): Promise<void> {
    const event: DocumentEvent = { type: "document.updated", document: toDocumentDto(document) };
    await this.broker.publish(document.userId, event);
  }

  private async publishDeleted(userId: string, id: string): Promise<void> {
    const event: DocumentEvent = { type: "document.deleted", id };
    await this.broker.publish(userId, event);
  }

  private decodeUtf8(buffer: Buffer): string {
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
      throw new BadRequestException("The file must be UTF-8 text.");
    }
  }
}
