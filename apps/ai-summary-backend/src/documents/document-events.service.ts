import type { Document } from "@app/db";
import { EventBrokerService } from "@app/events";
import { Injectable } from "@nestjs/common";
import type { DocumentEvent } from "./types/document-event.js";
import { toDocumentDto } from "./utils/to-document-dto.js";

// Every document change, pushed to its owner's open event streams
@Injectable()
export class DocumentEventsService {
  constructor(private readonly broker: EventBrokerService) {}

  // Same JSON as the REST replies, so the client can drop it straight into its list
  async publishUpdated(document: Document): Promise<void> {
    const event: DocumentEvent = { type: "document.updated", document: toDocumentDto(document) };
    await this.broker.publish(document.userId, event);
  }

  async publishDeleted(userId: string, id: string): Promise<void> {
    const event: DocumentEvent = { type: "document.deleted", id };
    await this.broker.publish(userId, event);
  }
}
