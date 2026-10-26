import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  Inject,
  Injectable,
  Module,
  NotFoundException,
  StreamableFile,
  type DynamicModule,
  type InjectionToken,
  type OnModuleInit,
} from "@nestjs/common";
import multer from "multer";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { Readable } from "node:stream";
import { HttpError } from "./errors.js";

// Any S3-compatible store (MinIO, AWS S3, R2…).
export type ObjectStorageConfig = {
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
};

export type StoredObject = {
  stream: Readable;
  contentType?: string;
  contentLength?: number;
};

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export const createObjectStorage = (config: ObjectStorageConfig) => {
  let client: S3Client | null = null;
  const Bucket = config.bucket;

  const getClient = (): S3Client => {
    if (!config.endpoint) throw new Error("Object storage endpoint is required");
    client ??= new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: { accessKeyId: config.accessKey, secretAccessKey: config.secretKey },
      forcePathStyle: true,
    });
    return client;
  };

  // Creates the bucket if it doesn't exist yet.
  const ensureReady = async () => {
    try {
      await getClient().send(new HeadBucketCommand({ Bucket }));
    } catch {
      await getClient().send(new CreateBucketCommand({ Bucket }));
    }
  };

  const exists = async (key: string): Promise<boolean> => {
    try {
      await getClient().send(new HeadObjectCommand({ Bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  };

  const put = async (key: string, body: Buffer, contentType?: string) => {
    await getClient().send(new PutObjectCommand({ Bucket, Key: key, Body: body, ContentType: contentType }));
  };

  const getObject = async (key: string): Promise<StoredObject | null> => {
    try {
      const response = await getClient().send(new GetObjectCommand({ Bucket, Key: key }));
      if (!response.Body) return null;
      return {
        stream: response.Body as Readable,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
      };
    } catch {
      return null;
    }
  };

  const deleteObject = async (key: string) => {
    try {
      await getClient().send(new DeleteObjectCommand({ Bucket, Key: key }));
    } catch {
      // ignore missing objects
    }
  };

  // Deletes every object under `prefix`, optionally keeping one key.
  const deleteByPrefix = async (prefix: string, keepKey?: string) => {
    let continuationToken: string | undefined;
    do {
      const listing = await getClient().send(
        new ListObjectsV2Command({ Bucket, Prefix: prefix, ContinuationToken: continuationToken }),
      );
      const keys =
        listing.Contents?.map((item) => item.Key).filter((key): key is string => !!key && key !== keepKey) ?? [];
      await Promise.all(keys.map((key) => deleteObject(key)));
      continuationToken = listing.IsTruncated ? listing.NextContinuationToken : undefined;
    } while (continuationToken);
  };

  // First existing `${prefix}${id}${ext}` for the given extensions (e.g. an avatar of unknown type).
  const findFirstKey = async (prefix: string, id: string, extensions = IMAGE_EXTENSIONS): Promise<string | null> => {
    for (const ext of extensions) {
      const key = `${prefix}${id}${ext}`;
      if (await exists(key)) return key;
    }
    return null;
  };

  return { ensureReady, exists, put, getObject, delete: deleteObject, deleteByPrefix, findFirstKey };
};

export type ObjectStorage = ReturnType<typeof createObjectStorage>;

// What FileInterceptor's in-memory storage hands to @UploadedFile()
export type UploadedFileData = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export type UploadOptions = {
  maxFileSizeMb: number;
  // Reject anything that isn't an image/* upload
  imagesOnly?: boolean;
};

type UploadedFileInfo = { originalname: string; mimetype: string };
type AcceptFile = (error: Error | null, acceptFile: boolean) => void;

// Multer options for Nest's MulterModule / FileInterceptor: uploads stay in memory for `objectStorage.put`
export const createUploadOptions = ({ maxFileSizeMb, imagesOnly = false }: UploadOptions) => ({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req: unknown, file: UploadedFileInfo, accept: AcceptFile) => {
    if (imagesOnly && !file.mimetype.startsWith("image/")) {
      accept(new HttpError(400, "Only image files are allowed"), false);
      return;
    }
    // Never trust client-sent paths in file names
    file.originalname = path.basename(file.originalname);
    accept(null, true);
  },
});

// `folder/<uuid>.<ext>`: a new key per upload, e.g. chat attachments
export const uniqueObjectKey = (folder: string, originalName: string) =>
  `${folder}/${randomUUID()}${path.extname(originalName)}`;

// `folder/<id>.<ext>`: one object per entity, e.g. a user's avatar
export const entityObjectKey = (folder: string, id: string, originalName: string, defaultExt = ".jpg") =>
  `${folder}/${id}${path.extname(originalName).toLowerCase() || defaultExt}`;

const OBJECT_STORAGE_OPTIONS = Symbol("OBJECT_STORAGE_OPTIONS");

// The app's MinIO bucket as a Nest provider; the bucket is created on startup
@Injectable()
export class ObjectStorageService implements OnModuleInit {
  readonly bucket: ObjectStorage;

  constructor(@Inject(OBJECT_STORAGE_OPTIONS) config: ObjectStorageConfig) {
    if (!config.endpoint) throw new Error("MINIO_ENDPOINT is required. Uploads are stored in MinIO.");
    this.bucket = createObjectStorage(config);
  }

  async onModuleInit() {
    await this.bucket.ensureReady();
  }

  // An object as a StreamableFile, inline or as a download with its original name; 404 when missing
  async streamFile(key: string, options: { inline?: boolean; downloadName?: string } = {}): Promise<StreamableFile> {
    const object = await this.bucket.getObject(key);
    if (!object) throw new NotFoundException("File not found");
    const disposition = options.inline
      ? "inline"
      : options.downloadName
        ? `attachment; filename="${options.downloadName}"`
        : undefined;
    return new StreamableFile(object.stream, { type: object.contentType, length: object.contentLength, disposition });
  }
}

type ObjectStorageModuleOptions = {
  inject?: InjectionToken[];
  useFactory: (...args: never[]) => ObjectStorageConfig;
};

// Global ObjectStorageService, configured from the app's own config, e.g. inject: [appConfig.KEY]
@Module({})
export class ObjectStorageModule {
  static forRoot({ inject = [], useFactory }: ObjectStorageModuleOptions): DynamicModule {
    return {
      module: ObjectStorageModule,
      global: true,
      providers: [{ provide: OBJECT_STORAGE_OPTIONS, inject, useFactory }, ObjectStorageService],
      exports: [ObjectStorageService],
    };
  }
}
