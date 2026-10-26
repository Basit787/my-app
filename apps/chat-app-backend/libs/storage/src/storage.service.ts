import { createObjectStorage, type ObjectStorage } from "backend-common";
import { Inject, Injectable, NotFoundException, StreamableFile, type OnModuleInit } from "@nestjs/common";
import { appConfig, type AppConfig } from "@app/common";

// This app's MinIO bucket: every chat file, avatar and group image (Mongo keeps only metadata)
@Injectable()
export class StorageService implements OnModuleInit {
  readonly bucket: ObjectStorage;

  constructor(@Inject(appConfig.KEY) config: AppConfig) {
    if (!config.minio.endpoint) throw new Error("MINIO_ENDPOINT is required. All uploads are stored in MinIO.");
    this.bucket = createObjectStorage(config.minio);
  }

  async onModuleInit() {
    await this.bucket.ensureReady();
  }

  // An object as a Nest StreamableFile, inline (avatars) or as a download with its original name
  async streamFile(key: string, options: { inline?: boolean; downloadName?: string } = {}): Promise<StreamableFile> {
    const object = await this.bucket.getObject(key);
    if (!object) throw new NotFoundException("File not found");
    return new StreamableFile(object.stream, {
      type: object.contentType,
      length: object.contentLength,
      disposition: options.inline
        ? "inline"
        : options.downloadName
          ? `attachment; filename="${options.downloadName}"`
          : undefined,
    });
  }
}
