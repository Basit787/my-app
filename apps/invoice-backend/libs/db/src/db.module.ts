import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { InvoiceRepository } from "./repositories/invoice.repository.js";

// PostgreSQL through Prisma; features inject the repositories
@Global()
@Module({
  providers: [PrismaService, InvoiceRepository],
  exports: [PrismaService, InvoiceRepository],
})
export class DbModule {}
