/// <reference types="node" />
import { readFile, writeFile } from "node:fs/promises";
import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2022",
  // tsup sets `baseUrl` for the declaration build, which TypeScript 6 flags as deprecated
  dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
  // Frontend dev containers set TSUP_DTS=false: Vite never reads .d.ts, and the declaration build is memory-heavy
  ...(process.env.TSUP_DTS === "false" && { dts: false }),
  sourcemap: true,
  clean: !options.watch,
  // Ships the theme next to the built components; its @source then scans dist/ for class names
  onSuccess: async () => {
    const css = await readFile("src/styles/globals.css", "utf8");
    await writeFile("dist/globals.css", css.replace('@source "../";', '@source "./";'));
  },
}));
