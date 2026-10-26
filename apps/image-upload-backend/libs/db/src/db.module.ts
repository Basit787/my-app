import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { ImageRepository } from "./repositories/image.repository.js";

// PostgreSQL through Prisma; features inject the repositories
@Global()
@Module({
  providers: [PrismaService, ImageRepository],
  exports: [PrismaService, ImageRepository],
})
export class DbModule {}
