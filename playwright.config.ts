import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config for the Cesium globe smoke test. Boots the Storybook dev server
 * (whose `predev` hook copies the Cesium runtime assets) and drives the
 * FullGlobe example story to confirm the viewer reaches a ready state.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 120_000,
  use: {
    baseURL: "http://localhost:6006",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // SwiftShader gives headless Chromium a software WebGL backend so
        // Cesium can actually initialise its GL context in CI.
        launchOptions: {
          args: ["--use-gl=angle", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
        },
      },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:6006",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
