import { Injectable } from "@nestjs/common";
import type { Conversation } from "@prisma-app/client";
import { PrismaService } from "../prisma.service.js";

// Data access for conversations; every read is scoped to the owner
@Injectable()
export class ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string): Promise<Conversation> {
    return this.prisma.conversation.create({ data: { userId } });
  }

  // Most recently active first
  listForUser(userId: string): Promise<Conversation[]> {
    return this.prisma.conversation.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
  }

  findForUser(id: string, userId: string): Promise<Conversation | null> {
    return this.prisma.conversation.findFirst({ where: { id, userId } });
  }

  rename(id: string, title: string): Promise<Conversation> {
    return this.prisma.conversation.update({ where: { id }, data: { title } });
  }

  // Moves the conversation to the top of the list after a new message
  touch(id: string): Promise<Conversation> {
    return this.prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.conversation.delete({ where: { id } });
  }
}
