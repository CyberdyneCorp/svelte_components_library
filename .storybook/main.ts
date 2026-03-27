import type { StorybookConfig } from "@storybook/svelte-vite";
import path from "path";

const config: StorybookConfig = {
  stories: [
    "./static-docs/**/*.mdx",
    "../packages/**/*.mdx",
    "../packages/**/src/**/*.stories.@(js|ts|svelte)",
  ],
  addons: [
    "@storybook/addon-svelte-csf",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/svelte-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@cyberdyne/svelte-ui-core": path.resolve(
        __dirname,
        "../packages/ui/core/src/lib/index.ts",
      ),
      "@cyberdyne/svelte-ui-foundation": path.resolve(
        __dirname,
        "../packages/ui/foundation/src/lib/index.ts",
      ),
    };

    return config;
  },
};

export default config;
