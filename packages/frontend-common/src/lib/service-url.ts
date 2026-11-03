import { PORTS } from "ports";
import { APP_PATHS } from "./app-paths";
import { APP_SUBDOMAINS } from "./app-subdomains";
import { deployedDomain } from "./deployed-domain";

// Subdomains: <side>.<domain>. One HTTPS domain: <origin><app path>. Local: http://<current host>:<port>
export const serviceUrl = <P extends keyof typeof PORTS>(
  project: P,
  side: Extract<keyof (typeof PORTS)[P], "frontend" | "backend">,
): string => {
  const { protocol, hostname, port, origin } = window.location;
  const domain = deployedDomain();
  if (domain) return `${protocol}//${APP_SUBDOMAINS[project][side]}.${domain}${port ? `:${port}` : ""}`;
  if (protocol === "https:" && port === "") return `${origin}${APP_PATHS[project][side]}`;
  return `http://${hostname || "localhost"}:${String(PORTS[project][side])}`;
};
