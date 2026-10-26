export const linkEndpoints = {
  list: () => "/links",
  link: (id: string) => `/links/${encodeURIComponent(id)}`,
  stats: (id: string) => `/links/${encodeURIComponent(id)}/stats`,
} as const;
