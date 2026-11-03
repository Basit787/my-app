import { PORTS } from "ports";

// Origins of the web apps on localhost, the default CORS allow-list of the APIs
export const localAppOrigins = (): string[] =>
  Object.values(PORTS).flatMap((ports) =>
    "frontend" in ports ? [`http://localhost:${ports.frontend}`, `https://localhost:${ports.frontend}`] : [],
  );
