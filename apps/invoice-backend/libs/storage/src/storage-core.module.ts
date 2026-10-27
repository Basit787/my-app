import { appConfig, type AppConfig } from "@app/common";
import { ObjectStorageModule } from "backend-common";

// Shared MinIO storage (backend-common) on this app's bucket: every uploaded invoice file (PostgreSQL keeps only its key)
export const StorageCoreModule = ObjectStorageModule.forRoot({
  inject: [appConfig.KEY],
  useFactory: (config: AppConfig) => config.minio,
});
