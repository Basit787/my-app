import react from "eslint-config/react";

export default [
  ...react,
  // shadcn files export variants next to their components
  { rules: { "react-refresh/only-export-components": "off" } },
  // CLI-generated primitives destructure props just to drop them
  {
    files: ["src/ui/**"],
    rules: { "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", ignoreRestSiblings: true }] },
  },
];
