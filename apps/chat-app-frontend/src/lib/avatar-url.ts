export const normalizeAvatarUrl = (imageUrl?: string | null): string | undefined => {
  if (!imageUrl?.trim()) return undefined;

  const trimmed = imageUrl.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const { pathname, search } = new URL(trimmed);
      if (pathname.startsWith("/api/")) return `${pathname}${search}`;
      if (pathname.startsWith("/profile/")) return `/api${pathname}${search}`;
      return `${pathname}${search}`;
    } catch {
      return undefined;
    }
  }

  if (trimmed.startsWith("/api/")) return trimmed;
  if (trimmed.startsWith("/profile/")) return `/api${trimmed}`;
  if (trimmed.startsWith("/")) return trimmed;

  return undefined;
};

// No uploaded photo means initials (the chat keeps no profile pictures)
export const userAvatarUrl = (_username: string, imageUrl?: string | null) => normalizeAvatarUrl(imageUrl);

export const groupAvatarUrl = (groupId: string, imageUrl?: string | null) => {
  const normalized = normalizeAvatarUrl(imageUrl);
  if (normalized) return normalized;
  return imageUrl ? `/api/groups/${groupId}/avatar` : undefined;
};

export const avatarApiPath = (imageUrl?: string | null): string | undefined => {
  const normalized = normalizeAvatarUrl(imageUrl);
  if (!normalized?.startsWith("/api/")) return undefined;
  return normalized.replace(/^\/api/, "");
};
