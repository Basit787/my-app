import type { PerSide } from "../types/per-side";

// Path of each service once deployed behind one HTTPS domain, e.g. https://myapp.com/invoices
export const APP_PATHS: PerSide = {
  home: { frontend: "/" },
  auth: { backend: "/auth" },
  linkShortener: { frontend: "/links", backend: "/links-api" },
  imageUpload: { frontend: "/images", backend: "/images-api" },
  aiSummary: { frontend: "/summaries", backend: "/summaries-api" },
  chatbot: { frontend: "/chatbot", backend: "/chatbot-api" },
  invoices: { frontend: "/invoices", backend: "/invoices-api" },
};
