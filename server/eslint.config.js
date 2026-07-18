import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules", "coverage", "uploads"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.node,
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-console": "off",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
