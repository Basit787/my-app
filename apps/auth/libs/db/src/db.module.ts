import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { UserRepository } from "./repositories/user.repository.js";

// PostgreSQL through Prisma; features inject the repositories
@Global()
@Module({
  providers: [PrismaService, UserRepository],
  exports: [PrismaService, UserRepository],
})
export class DbModule {}
