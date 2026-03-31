// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import svelte from "eslint-plugin-svelte";

export default [js.configs.recommended, ...svelte.configs["flat/recommended"], {
  files: ["**/*.ts"],
  languageOptions: {
    parser: tsparser,
    parserOptions: {
      extraFileExtensions: [".svelte"],
    },
  },
  plugins: {
    "@typescript-eslint": tseslint,
  },
  rules: {
    ...tseslint.configs.recommended.rules,
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_" },
    ],
  },
}, {
  files: ["**/*.svelte"],
  languageOptions: {
    parserOptions: {
      parser: tsparser,
    },
  },
}, {
  ignores: ["**/dist/", "**/docs/", "**/node_modules/", "**/.svelte-kit/"],
}, ...storybook.configs["flat/recommended"]];
