import { uniqueObjectKey } from "backend-common";
import { type AuthUser, type MessageFileDto, type UploadedFileData } from "@app/common";
import { StorageService } from "@app/storage";
import { SharedFileRepository } from "@app/db";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FilesService {
  constructor(
    private readonly files: SharedFileRepository,
    private readonly storage: StorageService,
  ) {}

  // Stores the bytes in MinIO and returns the metadata a file message carries
  async save(room: string, user: AuthUser, file: UploadedFileData): Promise<MessageFileDto> {
    const mimeType = file.mimetype || "application/octet-stream";
    const storedName = uniqueObjectKey("files", file.originalname);
    await this.storage.bucket.put(storedName, file.buffer, mimeType);
    const doc = await this.files.create({
      room,
      user: user.username,
      userId: user.id,
      originalName: file.originalname,
      mimeType,
      size: file.size,
      storedName,
    });
    return { id: doc._id.toString(), name: doc.originalName, mimeType, size: doc.size };
  }

  findInRoom(room: string, id: string) {
    return this.files.findInRoom(room, id);
  }
}
