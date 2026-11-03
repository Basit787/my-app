import { appConfig, type AppConfig } from "@app/common";
import { ObjectStorageModule } from "backend-common";

export const StorageCoreModule = ObjectStorageModule.forRoot({
  inject: [appConfig.KEY],
  useFactory: (config: AppConfig) => config.s3,
});
