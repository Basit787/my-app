import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { ConversationRepository } from "./repositories/conversation.repository.js";
import { DocumentRepository } from "./repositories/document.repository.js";

// PostgreSQL through Prisma; features inject the repositories
@Global()
@Module({
  providers: [PrismaService, ConversationRepository, DocumentRepository],
  exports: [PrismaService, ConversationRepository, DocumentRepository],
})
export class DbModule {}
