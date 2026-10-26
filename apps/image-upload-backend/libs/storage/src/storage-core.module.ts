import { appConfig, type AppConfig } from "@app/common";
import { ObjectStorageModule } from "backend-common";

// Shared MinIO storage (backend-common) on this app's bucket: every uploaded image (PostgreSQL keeps only metadata)
export const StorageCoreModule = ObjectStorageModule.forRoot({
  inject: [appConfig.KEY],
  useFactory: (config: AppConfig) => config.minio,
});
