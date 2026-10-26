import { Module } from "@nestjs/common";
import { SeedService } from "./seed.service.js";

// Demo data for `pnpm db:seed`; only used by the `seed` command
@Module({
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
