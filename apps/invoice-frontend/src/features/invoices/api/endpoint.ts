export const invoiceEndpoints = {
  list: () => "/invoices",
  events: () => "/events",
  upload: () => "/invoices/upload",
  detail: (id: string) => `/invoices/${encodeURIComponent(id)}`,
  file: (id: string) => `/invoices/${encodeURIComponent(id)}/file`,
  page: (id: string, page: number) => `/invoices/${encodeURIComponent(id)}/pages/${page}`,
  editPlan: (id: string) => `/invoices/${encodeURIComponent(id)}/edit-plan`,
  pdf: (id: string) => `/invoices/${encodeURIComponent(id)}/pdf`,
  extract: (id: string) => `/invoices/${encodeURIComponent(id)}/extract`,
  archive: (id: string) => `/invoices/${encodeURIComponent(id)}/archive`,
  restore: (id: string) => `/invoices/${encodeURIComponent(id)}/restore`,
};
