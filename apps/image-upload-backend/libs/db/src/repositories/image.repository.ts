import { Injectable } from "@nestjs/common";
import type { Image } from "@prisma-app/client";
import { PrismaService } from "../prisma.service.js";

type NewImage = Pick<Image, "userId" | "originalName" | "mimeType" | "size" | "storedName" | "status" | "scheduledAt">;

// Every query on the `images` table; user-facing lookups are scoped to the owner's user id
@Injectable()
export class ImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewImage): Promise<Image> {
    return this.prisma.image.create({ data });
  }

  // Newest first; scheduled ones by publish time, soonest first
  findPageByUser(userId: string, status: Image["status"], skip: number, take: number): Promise<[Image[], number]> {
    const where = { userId, status, deletedAt: null };
    return this.prisma.$transaction([
      this.prisma.image.findMany({
        where,
        orderBy: status === "scheduled" ? { scheduledAt: "asc" } : { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.image.count({ where }),
    ]);
  }

  findBinPageByUser(userId: string, skip: number, take: number): Promise<[Image[], number]> {
    const where = { userId, deletedAt: { not: null } };
    return this.prisma.$transaction([
      this.prisma.image.findMany({ where, orderBy: { deletedAt: "desc" }, skip, take }),
      this.prisma.image.count({ where }),
    ]);
  }

  countByUser(userId: string): Promise<[number, number, number]> {
    return this.prisma.$transaction([
      this.prisma.image.count({ where: { userId, status: "active", deletedAt: null } }),
      this.prisma.image.count({ where: { userId, status: "scheduled", deletedAt: null } }),
      this.prisma.image.count({ where: { userId, deletedAt: { not: null } } }),
    ]);
  }

  findOwned(id: string, userId: string): Promise<Image | null> {
    return this.prisma.image.findFirst({ where: { id, userId } });
  }

  moveToBin(id: string): Promise<Image> {
    return this.prisma.image.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  restore(id: string): Promise<Image> {
    return this.prisma.image.update({ where: { id }, data: { deletedAt: null } });
  }

  // No-op when the image is gone or already active
  async publish(id: string): Promise<void> {
    await this.prisma.image.updateMany({ where: { id, status: "scheduled" }, data: { status: "active" } });
  }

  findBinnedBefore(cutoff: Date, take: number): Promise<Image[]> {
    return this.prisma.image.findMany({ where: { deletedAt: { lt: cutoff } }, orderBy: { deletedAt: "asc" }, take });
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.prisma.image.deleteMany({ where: { id: { in: ids } } });
  }
}
