import type { PORTS } from "ports";

export type AppViteConfigOptions = {
  // Dev server port, from PORTS
  port: number;
  // Project whose backend is proxied at /api (prefix stripped); API_PROXY_TARGET overrides its URL
  api?: Exclude<keyof typeof PORTS, "home">;
  // Paths also proxied to the backend unchanged, e.g. ["/r"] for short links on the app's own origin
  passthrough?: string[];
};
