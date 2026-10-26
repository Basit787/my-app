import { Injectable } from "@nestjs/common";
import type { Document, DocumentStatus } from "@prisma-app/client";
import { PrismaService } from "../prisma.service.js";

type NewDocument = Pick<Document, "userId" | "filename" | "storageKey" | "size">;

// Data access for documents; user-facing lookups are scoped to the owner
@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewDocument): Promise<Document> {
    return this.prisma.document.create({ data });
  }

  // Newest first
  listForUser(userId: string): Promise<Document[]> {
    return this.prisma.document.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }

  findForUser(id: string, userId: string): Promise<Document | null> {
    return this.prisma.document.findFirst({ where: { id, userId } });
  }

  // Documents whose summary was never finished, e.g. the server restarted mid-way
  async pendingIds(): Promise<string[]> {
    const rows = await this.prisma.document.findMany({
      where: { status: { in: ["UPLOADED", "PROCESSING"] } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  updateStatus(id: string, status: DocumentStatus): Promise<Document> {
    return this.prisma.document.update({ where: { id }, data: { status } });
  }

  updateSummary(id: string, summary: string): Promise<Document> {
    return this.prisma.document.update({ where: { id }, data: { summary, status: "COMPLETED" } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } });
  }
}
