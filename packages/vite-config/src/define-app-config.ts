import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { serviceUrl } from "ports";
import { defineConfig, type ProxyOptions } from "vite";
import type { AppViteConfigOptions } from "./app-vite-config-options.js";

const LOOPBACK = "127.0.0.1";

// Vite config every web app shares: React, TanStack Router, Tailwind, the /auth-api proxy and an optional /api backend
export const defineAppConfig = ({ port, api, passthrough = [] }: AppViteConfigOptions) => {
  const authTarget = process.env.AUTH_PROXY_TARGET || serviceUrl("auth", "backend", { hostname: LOOPBACK });
  const proxy: Record<string, ProxyOptions> = {
    // The auth service on the app's own origin, so its cookies are first-party
    "/auth-api": { target: authTarget, changeOrigin: true, rewrite: (p) => p.replace(/^\/auth-api/, "/api") },
  };
  if (api) {
    const apiTarget = process.env.API_PROXY_TARGET || serviceUrl(api, "backend", { hostname: LOOPBACK });
    proxy["/api"] = { target: apiTarget, changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, "") };
    // A "^/r/" key is a RegExp, so "/r" never catches paths such as "/robots.txt"
    for (const path of passthrough) proxy[`^${path}/`] = { target: apiTarget, changeOrigin: true };
  }

  return defineConfig({
    resolve: { tsconfigPaths: true },
    plugins: [devtools(), tailwindcss(), tanstackRouter({ target: "react", autoCodeSplitting: true }), viteReact()],
    build: { target: "es2022" },
    server: {
      host: true,
      port,
      // Transform the entry and routes at startup so the first visit isn't compiled on demand
      warmup: { clientFiles: ["./src/main.tsx", "./src/routes/**/*.tsx"] },
      // File events don't reach Docker containers reliably on macOS
      watch: { usePolling: process.env.CHOKIDAR_USEPOLLING === "true" },
      proxy,
      // Host names nginx forwards, e.g. ".example.com" (localhost and *.localhost are always allowed)
      allowedHosts: (process.env.ALLOWED_HOSTS ?? "").split(",").filter(Boolean),
    },
    // allowedHosts: behind an ingress the app is reached by host name (chat.example.com), not localhost
    preview: { port: 80, host: true, allowedHosts: true, proxy },
  });
};
