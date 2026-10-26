import tseslint from "typescript-eslint";
import { base } from "./base.js";

/** Node services: base rules, plus `declare global` namespaces allowed in .d.ts files. */
export default tseslint.config(...base, {
  files: ["**/*.d.ts"],
  rules: { "@typescript-eslint/no-namespace": "off" },
});
