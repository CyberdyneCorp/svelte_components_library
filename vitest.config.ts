import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    svelte({
      hot: false,
    }),
  ],
  resolve: {
    conditions: ["browser"],
  },
  test: {
    coverage: {
      include: ["packages/ui/core/src/lib/**/*.{svelte,ts}"],
      exclude: [
        "**/index.ts",
        "**/*.test.ts",
        "**/*.stories.svelte",
        "**/_testdata/**",
        "**/tokens/**",
      ],
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          globals: true,
          environment: "jsdom",
          include: ["packages/**/*.test.ts"],
          setupFiles: ["./vitest.setup.ts"],
          css: false,
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          // Cesium stories mount a WebGL globe. Headless CI has no GPU, so
          // give it software WebGL (SwiftShader) — otherwise the Cesium
          // Viewer fails to construct and the globe-mounting stories hang.
          // Software rendering is slower than a real GPU, hence the raised
          // timeout.
          testTimeout: 30000,
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
                launch: {
                  args: [
                    "--use-gl=angle",
                    "--use-angle=swiftshader",
                    "--enable-unsafe-swiftshader",
                    "--ignore-gpu-blocklist",
                    "--enable-webgl",
                  ],
                },
              },
            ],
          },
        },
      },
    ],
  },
});
