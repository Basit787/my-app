import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { ConversationRepository } from "./repositories/conversation.repository.js";

// PostgreSQL through Prisma; features inject the repositories
@Global()
@Module({
  providers: [PrismaService, ConversationRepository],
  exports: [PrismaService, ConversationRepository],
})
export class DbModule {}
