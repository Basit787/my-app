import { APP_SUBDOMAINS } from "./app-subdomains";

// The parent domain when the page runs on one of APP_SUBDOMAINS (invoices.example.com → example.com), else null
export const deployedDomain = (): string | null => {
  const [firstLabel, ...rest] = window.location.hostname.split(".");
  const subdomains: string[] = Object.values(APP_SUBDOMAINS).flatMap((sides) => Object.values(sides));
  return subdomains.includes(firstLabel) && rest.length >= 2 ? rest.join(".") : null;
};
