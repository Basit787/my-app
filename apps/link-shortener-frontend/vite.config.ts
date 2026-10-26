import { PORTS } from "ports";
import { defineAppConfig } from "vite-config";

// /r/<slug> short links are served by the backend on this app's own origin
export default defineAppConfig({ port: PORTS.linkShortener.frontend, api: "linkShortener", passthrough: ["/r"] });
