import react from "eslint-config/react";

export default [
  { ignores: ["src/routeTree.gen.ts"] },
  ...react,
  // Route files export only `Route`; the router plugin code-splits their components
  { files: ["src/routes/**"], rules: { "react-refresh/only-export-components": "off" } },
];
