import { Global, Module } from "@nestjs/common";
import { StorageService } from "./storage.service.js";

// MinIO object storage for every feature
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
