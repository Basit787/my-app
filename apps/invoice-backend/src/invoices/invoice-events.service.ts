import type { Invoice } from "@app/db";
import { EventBrokerService } from "@app/events";
import { Injectable } from "@nestjs/common";
import type { InvoiceEvent } from "./types/invoice-event.js";
import { toInvoiceDto } from "./utils/to-invoice-dto.js";

// Every invoice change, pushed to its owner's open event streams
@Injectable()
export class InvoiceEventsService {
  constructor(private readonly broker: EventBrokerService) {}

  // Same JSON as the REST replies, so the client can drop it straight into its list
  async publishUpdated(invoice: Invoice): Promise<void> {
    const event: InvoiceEvent = { type: "invoice.updated", invoice: toInvoiceDto(invoice) };
    await this.broker.publish(invoice.userId, event);
  }

  async publishDeleted(userId: string, id: string): Promise<void> {
    const event: InvoiceEvent = { type: "invoice.deleted", id };
    await this.broker.publish(userId, event);
  }
}
