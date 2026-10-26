import { LinkRepository, type Link } from "@app/db";
import { ConflictException, Injectable } from "@nestjs/common";
import { isUUID } from "class-validator";
import type { CreateLinkDto } from "./dto/create-link.dto.js";
import type { LinkStatsDto } from "./dto/link-stats.dto.js";
import type { LinkDto } from "./dto/link.dto.js";
import type { UpdateLinkDto } from "./dto/update-link.dto.js";
import { lastDays } from "./utils/last-days.js";
import { randomSlug } from "./utils/random-slug.js";
import { toLinkDto } from "./utils/to-link-dto.js";

const STATS_DAYS = 30;

// Business rules for links; null means not found for this user
@Injectable()
export class LinksService {
  constructor(private readonly links: LinkRepository) {}

  async list(userId: string): Promise<LinkDto[]> {
    const links = await this.links.listForUser(userId);
    return links.map(toLinkDto);
  }

  async create(userId: string, input: CreateLinkDto): Promise<LinkDto> {
    const link = await this.links.create({
      userId,
      url: input.url,
      slug: await this.uniqueSlug(input.slug),
      title: input.title || null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    });
    return toLinkDto(link);
  }

  async get(id: string, userId: string): Promise<LinkDto | null> {
    const link = await this.findOwned(id, userId);
    return link ? toLinkDto(link) : null;
  }

  async update(id: string, userId: string, input: UpdateLinkDto): Promise<LinkDto | null> {
    const current = await this.findOwned(id, userId);
    if (!current) return null;
    const slug = input.slug && input.slug !== current.slug ? await this.uniqueSlug(input.slug) : undefined;
    const link = await this.links.update(current.id, {
      url: input.url,
      slug,
      title: input.title === undefined ? undefined : input.title || null,
      expiresAt: input.expiresAt === undefined ? undefined : input.expiresAt ? new Date(input.expiresAt) : null,
    });
    return toLinkDto(link);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    if (!isUUID(id)) return false;
    return this.links.deleteForUser(id, userId);
  }

  async stats(id: string, userId: string): Promise<LinkStatsDto | null> {
    const link = await this.findOwned(id, userId);
    if (!link) return null;
    const { from, days } = lastDays(STATS_DAYS);
    const rows = await this.links.dailyClicks(link.id, from);
    const counts = new Map(rows.map((row) => [row.day, row.count]));
    return {
      linkId: link.id,
      totalClicks: link.clickCount,
      days: days.map((day) => ({ day, count: counts.get(day) ?? 0 })),
    };
  }

  // Target URL for a live slug, recording the click; null when unknown or expired
  async resolve(slug: string, referrer: string | null, userAgent: string | null): Promise<string | null> {
    const link = await this.links.findBySlug(slug);
    if (!link || (link.expiresAt && link.expiresAt.getTime() < Date.now())) return null;
    await this.links.recordClick(link.id, referrer, userAgent);
    return link.url;
  }

  // Link ids are UUIDs; anything else cannot exist
  private findOwned(id: string, userId: string): Promise<Link | null> {
    if (!isUUID(id)) return Promise.resolve(null);
    return this.links.findForUser(id, userId);
  }

  // The requested slug if it is free (409 otherwise), or a fresh random one
  private async uniqueSlug(requested?: string): Promise<string> {
    if (requested) {
      if (await this.links.slugExists(requested)) throw new ConflictException("That short link is already taken");
      return requested;
    }
    for (;;) {
      const slug = randomSlug();
      if (!(await this.links.slugExists(slug))) return slug;
    }
  }
}
