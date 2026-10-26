import { appConfig, type AppConfig, type UploadedFileData } from "@app/common";
import { ImageRepository, type Image } from "@app/db";
import { ObjectStorageService } from "@app/storage";
import { BadRequestException, Inject, Injectable, Logger, StreamableFile } from "@nestjs/common";
import { uniqueObjectKey } from "backend-common";
import type { ImageCountsDto } from "./dto/image-counts.dto.js";
import type { ImagePageDto } from "./dto/image-page.dto.js";
import type { ImageDto } from "./dto/image.dto.js";
import { PublishImageQueue } from "./queues/publish-image.queue.js";
import { toImageDto } from "./utils/to-image-dto.js";

// 400 with one field's message, the same shape as a DTO validation failure
const invalidField = (field: string, message: string) =>
  new BadRequestException({ error: "Invalid request", details: { [field]: [message] } });

// The signed-in user's gallery; null means the image is not found for this user
@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    @Inject(appConfig.KEY) private readonly config: AppConfig,
    private readonly images: ImageRepository,
    private readonly storage: ObjectStorageService,
    private readonly publishQueue: PublishImageQueue,
  ) {}

  async list(userId: string, status: Image["status"], page: number, pageSize: number): Promise<ImagePageDto> {
    const [images, total] = await this.images.findPageByUser(userId, status, (page - 1) * pageSize, pageSize);
    return { images: images.map((image) => this.toDto(image)), total, page, pageSize };
  }

  async bin(userId: string, page: number, pageSize: number): Promise<ImagePageDto> {
    const [images, total] = await this.images.findBinPageByUser(userId, (page - 1) * pageSize, pageSize);
    return { images: images.map((image) => this.toDto(image)), total, page, pageSize };
  }

  async counts(userId: string): Promise<ImageCountsDto> {
    const [active, scheduled, bin] = await this.images.countByUser(userId);
    return { active, scheduled, bin };
  }

  // Stores the bytes in MinIO and the metadata in PostgreSQL; a scheduled upload is published by the queue
  async upload(userId: string, file: UploadedFileData | undefined, scheduledAtText?: string): Promise<ImageDto> {
    if (!file) throw invalidField("file", "No image uploaded");
    if (file.size === 0) throw invalidField("file", "The file is empty");
    const scheduledAt = scheduledAtText ? new Date(scheduledAtText) : null;
    if (scheduledAt && scheduledAt.getTime() <= Date.now()) throw invalidField("scheduledAt", "Must be in the future");

    const storedName = uniqueObjectKey("images", file.originalname);
    await this.storage.bucket.put(storedName, file.buffer, file.mimetype);
    const image = await this.images.create({
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storedName,
      status: scheduledAt ? "scheduled" : "active",
      scheduledAt,
    });
    if (scheduledAt) await this.publishQueue.scheduleAt(scheduledAt, image.id);
    this.logger.log(`Image uploaded. id=${image.id} scheduled=${!!scheduledAt}`);
    return this.toDto(image);
  }

  async file(id: string, userId: string): Promise<StreamableFile | null> {
    const image = await this.images.findOwned(id, userId);
    const object = image && (await this.storage.bucket.getObject(image.storedName));
    if (!image || !object) return null;
    return new StreamableFile(object.stream, { type: object.contentType ?? image.mimeType });
  }

  // Moves the image to the bin; the purge-bin job deletes it after BIN_RETENTION_DAYS
  async moveToBin(id: string, userId: string): Promise<boolean> {
    const image = await this.images.findOwned(id, userId);
    if (!image || image.deletedAt) return false;
    await this.images.moveToBin(image.id);
    return true;
  }

  async restore(id: string, userId: string): Promise<ImageDto | null> {
    const image = await this.images.findOwned(id, userId);
    if (!image?.deletedAt) return null;
    return this.toDto(await this.images.restore(image.id));
  }

  // Deletes a binned image for good: the object in MinIO, then its row
  async purge(id: string, userId: string): Promise<boolean> {
    const image = await this.images.findOwned(id, userId);
    if (!image?.deletedAt) return false;
    await this.storage.bucket.delete(image.storedName);
    await this.images.deleteMany([image.id]);
    return true;
  }

  private toDto(image: Image): ImageDto {
    return toImageDto(image, this.config.binRetentionDays);
  }
}
