import { Injectable } from "@nestjs/common";
import type { Document } from "@prisma-app/client";
import { PrismaService } from "../prisma.service.js";

type NewDocument = Omit<Document, "createdAt">;

@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewDocument): Promise<Document> {
    return this.prisma.document.create({ data });
  }

  listForConversation(conversationId: string): Promise<Document[]> {
    return this.prisma.document.findMany({ where: { conversationId }, orderBy: { createdAt: "asc" } });
  }

  countForConversation(conversationId: string): Promise<number> {
    return this.prisma.document.count({ where: { conversationId } });
  }

  findForConversation(id: string, conversationId: string): Promise<Document | null> {
    return this.prisma.document.findFirst({ where: { id, conversationId } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } });
  }
}
