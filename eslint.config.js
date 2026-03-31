// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import svelte from "eslint-plugin-svelte";
import globals from "globals";

export default [js.configs.recommended, ...svelte.configs["flat/recommended"], {
  files: ["**/*.ts"],
  languageOptions: {
    parser: tsparser,
    parserOptions: {
      extraFileExtensions: [".svelte"],
    },
    globals: {
      ...globals.browser,
      ...globals.node,
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
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "no-control-regex": "off",
  },
}, {
  files: ["**/*.svelte"],
  languageOptions: {
    parserOptions: {
      parser: tsparser,
    },
    globals: {
      ...globals.browser,
    },
  },
  rules: {
    "no-unused-vars": "off",
    "svelte/require-each-key": "warn",
    "svelte/prefer-svelte-reactivity": "warn",
    "svelte/no-useless-children-snippet": "warn",
    "svelte/no-navigation-without-resolve": "warn",
    "svelte/no-unused-svelte-ignore": "warn",
    "svelte/no-at-html-tags": "off",
    "svelte/no-dom-manipulating": "warn",
    "svelte/prefer-writable-derived": "warn",
    "svelte/no-useless-mustaches": "warn",
    "no-control-regex": "off",
  },
}, {
  files: ["**/*.test.ts"],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      // vitest globals
      describe: "readonly",
      it: "readonly",
      expect: "readonly",
      vi: "readonly",
      beforeEach: "readonly",
      afterEach: "readonly",
      beforeAll: "readonly",
      afterAll: "readonly",
    },
  },
}, {
  ignores: ["**/dist/", "**/docs/", "**/node_modules/", "**/.svelte-kit/"],
}, ...storybook.configs["flat/recommended"]];
