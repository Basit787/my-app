// Ports per project: frontend (dev server) and backend; the compose files repeat them
export const PORTS = {
  home: { frontend: 3000 },
  auth: { backend: 3001 },
  linkShortener: { frontend: 3004, backend: 3012 },
  imageUpload: { frontend: 3005, backend: 3006 },
  aiSummary: { frontend: 3007, backend: 3008 },
  chatbot: { frontend: 3009, backend: 3010 },
  invoices: { frontend: 3014, backend: 3013 },
} as const;
