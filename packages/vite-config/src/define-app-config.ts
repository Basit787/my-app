import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { PORTS } from "ports";
import { defineConfig, type ProxyOptions } from "vite";
import type { AppViteConfigOptions } from "./app-vite-config-options.js";

const localUrl = (port: number) => `http://127.0.0.1:${port}`;

// Vite config every web app shares: React, TanStack Router, Tailwind, the /auth-api proxy and an optional /api backend
export const defineAppConfig = ({ port, api, passthrough = [] }: AppViteConfigOptions) => {
  const authTarget = process.env.AUTH_PROXY_TARGET || localUrl(PORTS.auth.backend);
  const proxy: Record<string, ProxyOptions> = {
    "/auth-api": { target: authTarget, changeOrigin: true, rewrite: (p) => p.replace(/^\/auth-api/, "/api") },
  };
  if (api) {
    const apiTarget = process.env.API_PROXY_TARGET || localUrl(PORTS[api].backend);
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
      warmup: { clientFiles: ["./src/main.tsx", "./src/routes/**/*.tsx"] },
      // File events don't reach Docker containers reliably on macOS
      watch: { usePolling: process.env.CHOKIDAR_USEPOLLING === "true" },
      proxy,
    },
    preview: { host: true, port, allowedHosts: true, proxy },
  });
};
