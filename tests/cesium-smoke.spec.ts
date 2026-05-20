import { test, expect } from "@playwright/test";

/**
 * Smoke test for the Cesium globe stack. Loads the FullGlobe example story
 * directly via its iframe and waits for the viewer host to flip its
 * `data-cesium-ready` flag, which `<CesiumGlobe>` sets only after the
 * Cesium.Viewer has finished mounting. This guards against regressions in
 * the viewer lifecycle, asset hosting (CESIUM_BASE_URL), and the context
 * wiring that every layer depends on.
 */

// Storybook derives this id from the story title + name:
//   title "Cesium/Examples/FullGlobe" + name "FullGlobe"
const STORY_ID = "cesium-examples-fullglobe--full-globe";

test("FullGlobe example reaches a ready viewer", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto(`/iframe.html?id=${STORY_ID}&viewMode=story`);

  // The host mounts immediately; assert it's attached before waiting on ready.
  const globe = page.locator(".cy-cesium");
  await expect(globe).toBeAttached({ timeout: 30_000 });

  // The viewer flips data-cesium-ready to "true" once the Cesium.Viewer is
  // constructed and the camera is seeded. This is the real lifecycle signal —
  // `toBeVisible()` on the container is unreliable because the Cesium canvas
  // is absolutely positioned over it.
  await expect(globe).toHaveAttribute("data-cesium-ready", "true", {
    timeout: 60_000,
  });

  // The Cesium canvas should exist inside the host once ready.
  await expect(page.locator(".cy-cesium__viewer canvas")).toBeAttached();

  // No CESIUM_BASE_URL 404 fallback warning should appear — that one is the
  // most common silent misconfiguration.
  const baseUrlWarning = consoleErrors.find((e) =>
    e.includes("CESIUM_BASE_URL"),
  );
  expect(baseUrlWarning, "CESIUM_BASE_URL should be configured").toBeUndefined();
});

test("chrome overlays mount over the globe", async ({ page }) => {
  await page.goto(`/iframe.html?id=${STORY_ID}&viewMode=story`);

  const globe = page.locator(".cy-cesium");
  await expect(globe).toHaveAttribute("data-cesium-ready", "true", {
    timeout: 60_000,
  });

  // Layer control panel + coordinates HUD + minimap should all render.
  await expect(page.locator(".cy-cesium-layers")).toBeVisible();
  await expect(page.locator(".cy-cesium-hud")).toBeVisible();
  await expect(page.locator(".cy-cesium-minimap")).toBeVisible();
});
