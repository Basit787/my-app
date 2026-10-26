import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { LinkRepository } from "./repositories/link.repository.js";

// PostgreSQL through Prisma; features inject the repositories
@Global()
@Module({
  providers: [PrismaService, LinkRepository],
  exports: [PrismaService, LinkRepository],
})
export class DbModule {}
