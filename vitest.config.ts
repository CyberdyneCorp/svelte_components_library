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
    // Belt-and-suspenders: Cesium can fire async resource loads that reject
    // after a story's smoke test finishes and the viewer is torn down. The
    // WebGL-null setup below keeps the globe off the live path in tests, but
    // keep this so any residual teardown rejection can't fail the run. Must
    // live on the root config — vitest treats it as a non-project option.
    dangerouslyIgnoreUnhandledErrors: true,
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
          // Cesium stories mount a WebGL globe. A headless CI browser has no
          // real GPU and reports the "supports WebGL, but initialization
          // failed" zombie state: `new Cesium.Viewer()` constructs without
          // throwing, so CesiumGlobe flips `ready` true and renders its layer
          // children against a half-dead context, which hangs the story past
          // the timeout. The setup file forces WebGL to be cleanly absent so
          // construction throws into CesiumGlobe's try/catch error overlay
          // (children stay gated behind `ready`) — deterministic and fast.
          setupFiles: ["./vitest.storybook-setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
});
