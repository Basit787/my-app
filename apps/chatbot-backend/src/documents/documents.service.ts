import { ChatGraphService } from "@app/agent";
import { appConfig, type AppConfig } from "@app/common";
import { ConversationRepository, DocumentRepository } from "@app/db";
import { ObjectStorageService } from "@app/storage";
import { BadGatewayException, BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { uniqueObjectKey, type UploadedFileData } from "backend-common";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { DocumentDto } from "./dto/document.dto.js";
import { DOCUMENT_CONTENT_TYPES } from "./utils/document-content-types.js";
import { extractText } from "./utils/extract-text.js";
import { toDocumentDto } from "./utils/to-document-dto.js";

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @Inject(appConfig.KEY) private readonly config: AppConfig,
    private readonly conversations: ConversationRepository,
    private readonly documents: DocumentRepository,
    private readonly chatGraph: ChatGraphService,
    private readonly storage: ObjectStorageService,
  ) {}

  async list(conversationId: string, userId: string): Promise<DocumentDto[] | null> {
    const conversation = await this.conversations.findForUser(conversationId, userId);
    if (!conversation) return null;
    const documents = await this.documents.listForConversation(conversationId);
    return documents.map(toDocumentDto);
  }

  async upload(
    conversationId: string,
    userId: string,
    file: UploadedFileData | undefined,
  ): Promise<DocumentDto | null> {
    const conversation = await this.conversations.findForUser(conversationId, userId);
    if (!conversation) return null;
    if (!file) throw new BadRequestException({ error: "Invalid request", details: { file: ["No file uploaded"] } });
    if (file.size > this.config.maxFileSizeMb * 1024 * 1024) {
      throw new BadRequestException(`Maximum file size is ${this.config.maxFileSizeMb} MB.`);
    }
    const extension = path.extname(file.originalname).toLowerCase();
    const contentType = DOCUMENT_CONTENT_TYPES[extension];
    if (!contentType) throw new BadRequestException("Upload a .txt, .md or .pdf file.");

    const text = await extractText(file.buffer, extension);
    if (!text.trim()) throw new BadRequestException("No text found in this file (scanned PDFs are not supported).");

    const documentId = randomUUID();
    const objectKey = uniqueObjectKey(`documents/${conversationId}`, file.originalname);
    await this.storage.bucket.put(objectKey, file.buffer, contentType);

    let chunkCount: number;
    try {
      chunkCount = await this.chatGraph.indexDocument(
        { conversationId, documentId, fileName: file.originalname },
        text,
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Indexing failed. document=${documentId}: ${reason}`,
        error instanceof Error ? error.stack : "",
      );
      await this.chatGraph.deleteDocumentChunks(documentId);
      await this.storage.bucket.delete(objectKey);
      throw new BadGatewayException(`Could not index the document: ${reason}`);
    }

    const document = await this.documents.create({
      id: documentId,
      conversationId,
      fileName: file.originalname,
      contentType,
      size: file.size,
      objectKey,
      chunkCount,
    });
    this.logger.log(`Document uploaded. id=${document.id} file=${document.fileName} chunks=${chunkCount}`);
    return toDocumentDto(document);
  }

  async remove(conversationId: string, documentId: string, userId: string): Promise<boolean> {
    const conversation = await this.conversations.findForUser(conversationId, userId);
    if (!conversation) return false;
    const document = await this.documents.findForConversation(documentId, conversationId);
    if (!document) return false;
    await this.chatGraph.deleteDocumentChunks(documentId);
    await this.storage.bucket.delete(document.objectKey);
    await this.documents.delete(documentId);
    return true;
  }
}
