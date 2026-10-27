import { Injectable } from "@nestjs/common";
import type { Invoice, InvoiceStatus, Prisma } from "@prisma-app/client";
import { PrismaService } from "../prisma.service.js";

type NewInvoice = Pick<Invoice, "userId" | "filename" | "storageKey" | "contentType" | "size">;

// Data access for invoices; user-facing lookups are scoped to the owner
@Injectable()
export class InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewInvoice): Promise<Invoice> {
    return this.prisma.invoice.create({ data });
  }

  // Newest first
  listForUser(userId: string): Promise<Invoice[]> {
    return this.prisma.invoice.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }

  findForUser(id: string, userId: string): Promise<Invoice | null> {
    return this.prisma.invoice.findFirst({ where: { id, userId } });
  }

  // Invoices whose extraction never finished, e.g. the server restarted mid-way
  async pendingIds(): Promise<string[]> {
    const rows = await this.prisma.invoice.findMany({
      where: { status: { in: ["UPLOADED", "PROCESSING"] } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    return this.prisma.invoice.update({ where: { id }, data: { status, error: null } });
  }

  // Known as soon as the PDF is opened, so the page previews show before the reading finishes
  updatePageCount(id: string, pageCount: number): Promise<Invoice> {
    return this.prisma.invoice.update({ where: { id }, data: { pageCount } });
  }

  // Extracted text and fields; marks the invoice COMPLETED
  saveExtraction(id: string, data: Prisma.InvoiceUpdateInput): Promise<Invoice> {
    return this.prisma.invoice.update({ where: { id }, data: { ...data, status: "COMPLETED", error: null } });
  }

  markFailed(id: string, error: string): Promise<Invoice> {
    return this.prisma.invoice.update({ where: { id }, data: { status: "FAILED", error } });
  }

  // Fields corrected by the user
  updateFields(id: string, data: Prisma.InvoiceUpdateInput): Promise<Invoice> {
    return this.prisma.invoice.update({ where: { id }, data });
  }

  // A date archives the invoice, null restores it
  setArchivedAt(id: string, archivedAt: Date | null): Promise<Invoice> {
    return this.prisma.invoice.update({ where: { id }, data: { archivedAt } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.invoice.delete({ where: { id } });
  }
}
