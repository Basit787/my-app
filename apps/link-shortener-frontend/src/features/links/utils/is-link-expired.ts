import type { LinkDto } from "../api/api";

export const isLinkExpired = (link: LinkDto) => !!link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();
