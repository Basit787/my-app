import type { Image } from "@app/db";
import type { ImageDto } from "../dto/image.dto.js";
import { addDays } from "./add-days.js";

// The JSON shape of an image in every reply
export const toImageDto = (image: Image, binRetentionDays: number): ImageDto => ({
  id: image.id,
  name: image.originalName,
  mimeType: image.mimeType,
  size: image.size,
  status: image.status,
  scheduledAt: image.scheduledAt?.toISOString() ?? null,
  deletedAt: image.deletedAt?.toISOString() ?? null,
  purgeAt: image.deletedAt ? addDays(image.deletedAt, binRetentionDays).toISOString() : null,
  createdAt: image.createdAt.toISOString(),
});
