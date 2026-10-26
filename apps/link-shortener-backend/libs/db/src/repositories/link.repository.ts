import { Injectable } from "@nestjs/common";
import type { Link } from "@prisma-app/client";
import { PrismaService } from "../prisma.service.js";

type NewLink = Pick<Link, "userId" | "url" | "slug" | "title" | "expiresAt">;
type LinkChanges = Partial<Pick<Link, "url" | "slug" | "title" | "expiresAt">>;

// Data access for links and clicks; every owner-scoped query filters by userId
@Injectable()
export class LinkRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewLink): Promise<Link> {
    return this.prisma.link.create({ data });
  }

  // Newest first
  listForUser(userId: string): Promise<Link[]> {
    return this.prisma.link.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }

  findForUser(id: string, userId: string): Promise<Link | null> {
    return this.prisma.link.findFirst({ where: { id, userId } });
  }

  findBySlug(slug: string): Promise<Link | null> {
    return this.prisma.link.findUnique({ where: { slug } });
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await this.prisma.link.count({ where: { slug } });
    return count > 0;
  }

  // Call after findForUser: `id` must already belong to the user
  update(id: string, data: LinkChanges): Promise<Link> {
    return this.prisma.link.update({ where: { id }, data });
  }

  async deleteForUser(id: string, userId: string): Promise<boolean> {
    const { count } = await this.prisma.link.deleteMany({ where: { id, userId } });
    return count > 0;
  }

  async recordClick(linkId: string, referrer: string | null, userAgent: string | null): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.click.create({ data: { linkId, referrer, userAgent } }),
      this.prisma.link.update({ where: { id: linkId }, data: { clickCount: { increment: 1 } } }),
    ]);
  }

  // Clicks per UTC day since `from`, oldest first
  dailyClicks(linkId: string, from: Date): Promise<{ day: string; count: number }[]> {
    return this.prisma.$queryRaw<{ day: string; count: number }[]>`
      SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day, count(*)::int AS count
      FROM clicks
      WHERE link_id = ${linkId}::uuid AND created_at >= ${from}
      GROUP BY day
      ORDER BY day`;
  }
}
