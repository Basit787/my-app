import { appConfig, type AppConfig, type UploadedFileData } from "@app/common";
import { DocumentRepository } from "@app/db";
import { ObjectStorageService } from "@app/storage";
import { BadRequestException, ConflictException, Inject, Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { DocumentEventsService } from "./document-events.service.js";
import type { DocumentDto } from "./dto/document.dto.js";
import { SummarizerService } from "./summarizer.service.js";
import { toDocumentDto } from "./utils/to-document-dto.js";

// The signed-in user's documents; null means not found for this user. Summaries run in the background.
@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @Inject(appConfig.KEY) private readonly config: AppConfig,
    private readonly documents: DocumentRepository,
    private readonly storage: ObjectStorageService,
    private readonly events: DocumentEventsService,
    private readonly summarizer: SummarizerService,
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
    await this.events.publishUpdated(document);
    void this.summarizer.summarize(document.id);
    return toDocumentDto(document);
  }

  // Only a failed summary can be requested again
  async retrySummary(id: string, userId: string): Promise<DocumentDto | null> {
    const current = await this.documents.findForUser(id, userId);
    if (!current) return null;
    if (current.status !== "FAILED") throw new ConflictException("Only failed documents can be summarized again.");

    const document = await this.documents.updateStatus(current.id, "UPLOADED");
    await this.events.publishUpdated(document);
    void this.summarizer.summarize(document.id);
    return toDocumentDto(document);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const document = await this.documents.findForUser(id, userId);
    if (!document) return false;
    await this.storage.bucket.delete(document.storageKey);
    await this.documents.delete(document.id);
    this.logger.log(`Document deleted. id=${document.id}`);
    await this.events.publishDeleted(userId, document.id);
    return true;
  }

  private decodeUtf8(buffer: Buffer): string {
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
      throw new BadRequestException("The file must be UTF-8 text.");
    }
  }
}
