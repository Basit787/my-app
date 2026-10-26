import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { DocumentRepository } from "./repositories/document.repository.js";

// PostgreSQL through Prisma; features inject the repositories
@Global()
@Module({
  providers: [PrismaService, DocumentRepository],
  exports: [PrismaService, DocumentRepository],
})
export class DbModule {}
