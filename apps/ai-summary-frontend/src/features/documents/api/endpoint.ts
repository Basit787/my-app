export const documentEndpoints = {
  list: () => "/documents",
  events: () => "/events",
  upload: () => "/documents/upload",
  summarize: (id: string) => `/documents/${encodeURIComponent(id)}/summarize`,
  remove: (id: string) => `/documents/${encodeURIComponent(id)}`,
};
