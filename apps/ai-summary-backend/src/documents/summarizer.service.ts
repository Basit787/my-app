import { DocumentRepository } from "@app/db";
import { SummaryModelService } from "@app/llm";
import { ObjectStorageService } from "@app/storage";
import { Injectable, Logger } from "@nestjs/common";
import { DocumentEventsService } from "./document-events.service.js";
import { readText } from "./utils/read-text.js";

// Background summaries; every status change is pushed to the owner's event streams
@Injectable()
export class SummarizerService {
  private readonly logger = new Logger(SummarizerService.name);

  constructor(
    private readonly documents: DocumentRepository,
    private readonly storage: ObjectStorageService,
    private readonly model: SummaryModelService,
    private readonly events: DocumentEventsService,
  ) {}

  // Never throws: a failure marks the document FAILED
  async summarize(documentId: string): Promise<void> {
    try {
      this.logger.log(`Step 1/3: marking document as processing. id=${documentId}`);
      let document = await this.documents.updateStatus(documentId, "PROCESSING");
      await this.events.publishUpdated(document);

      this.logger.log(`Step 2/3: downloading text. id=${documentId} key=${document.storageKey}`);
      const object = await this.storage.bucket.getObject(document.storageKey);
      if (!object) throw new Error(`Object ${document.storageKey} is missing from the bucket`);
      const text = await readText(object.stream);

      this.logger.log(`Step 3/3: generating summary. id=${documentId} chars=${text.length}`);
      const summary = await this.model.generateSummary(text);

      document = await this.documents.updateSummary(documentId, summary);
      await this.events.publishUpdated(document);
      this.logger.log(`Document summarized. id=${documentId} summary_chars=${summary.length}`);
    } catch (error) {
      const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
      this.logger.error(`Document summarization failed. id=${documentId}: ${message}`);
      await this.markFailed(documentId);
    }
  }

  // Documents left unfinished by a restart are summarized again, one after another
  async resumePending(): Promise<void> {
    const documentIds = await this.documents.pendingIds();
    this.logger.log(`Resuming ${documentIds.length} unfinished documents.`);
    for (const documentId of documentIds) {
      await this.summarize(documentId);
    }
  }

  private async markFailed(documentId: string) {
    try {
      const document = await this.documents.updateStatus(documentId, "FAILED");
      await this.events.publishUpdated(document);
    } catch {
      // Usually the document was deleted while it was being summarized
      this.logger.warn(`Could not mark document as failed. id=${documentId}`);
    }
  }
}
