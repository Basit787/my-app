export const imageEndpoints = {
  list: (status: "active" | "scheduled", page: number) => `/images?status=${status}&page=${page}`,
  bin: (page: number) => `/images/bin?page=${page}`,
  counts: () => "/images/counts",
  upload: () => "/images",
  file: (id: string) => `/images/${encodeURIComponent(id)}/file`,
  remove: (id: string) => `/images/${encodeURIComponent(id)}`,
  restore: (id: string) => `/images/${encodeURIComponent(id)}/restore`,
  purge: (id: string) => `/images/${encodeURIComponent(id)}/permanent`,
};
