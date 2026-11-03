import type { PerSide } from "../types/per-side";

// Host name label of each service when deployed on subdomains (invoices.example.com)
export const APP_SUBDOMAINS: PerSide = {
  home: { frontend: "home" },
  auth: { backend: "auth" },
  linkShortener: { frontend: "links", backend: "links-api" },
  imageUpload: { frontend: "images", backend: "images-api" },
  aiSummary: { frontend: "summary", backend: "summary-api" },
  chatbot: { frontend: "chatbot", backend: "chatbot-api" },
  invoices: { frontend: "invoices", backend: "invoices-api" },
};
