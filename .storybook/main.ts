// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/svelte-vite";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: [
    "./static-docs/**/*.mdx",
    "../packages/**/*.mdx",
    "../packages/**/src/**/*.stories.@(js|ts|svelte)",
  ],

  addons: [
    "@storybook/addon-svelte-csf",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-vitest"
  ],

  framework: {
    name: "@storybook/svelte-vite",
    options: {},
  },

  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@cyberdynecorp/svelte-ui-core": path.resolve(
        __dirname,
        "../packages/ui/core/src/lib/index.ts",
      ),
      "@cyberdynecorp/svelte-ui-foundation": path.resolve(
        __dirname,
        "../packages/ui/foundation/src/lib/index.ts",
      ),
    };

    return config;
  }
};

export default config;
