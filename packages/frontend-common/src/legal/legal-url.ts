import { serviceUrl } from "../lib/service-url";

// Terms, privacy and cookie pages live on the home launcher
export const legalUrl = (page: "terms" | "privacy" | "cookies") =>
  `${serviceUrl("home", "frontend").replace(/\/$/, "")}/${page}`;
