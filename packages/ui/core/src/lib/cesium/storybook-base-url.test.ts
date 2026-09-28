import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * The published Storybook is served from a GitHub Pages subpath
 * (/svelte_components_library/). Cesium's runtime assets must resolve
 * against the document base there — a root-absolute "/cesium" 404s every
 * Worker, texture and widgets.css, and every Cesium story stops rendering.
 */

const here = dirname(fileURLToPath(import.meta.url));
const previewHead = readFileSync(
  join(here, "../../../../../../.storybook/preview-head.html"),
  "utf8",
);

const script = previewHead.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
const widgetsHref = previewHead.match(/<link[^>]+href="([^"]*widgets\.css)"/)?.[1] ?? "";

/** Run the head script as the browser would for a page at `url`. */
function baseUrlFor(url: string) {
  const win: { CESIUM_BASE_URL?: string } = {};
  new Function("window", "document", script)(win, { baseURI: url });
  return win.CESIUM_BASE_URL;
}

describe("Storybook Cesium asset base", () => {
  it.each([
    [
      "https://cyberdynecorp.github.io/svelte_components_library/iframe.html?id=x",
      "https://cyberdynecorp.github.io/svelte_components_library/cesium/",
    ],
    ["http://localhost:6006/iframe.html?id=x", "http://localhost:6006/cesium/"],
  ])("resolves CESIUM_BASE_URL under the page's path (%s)", (url, expected) => {
    expect(baseUrlFor(url)).toBe(expected);
  });

  it("loads widgets.css relative to the page, not the domain root", () => {
    const page = "https://cyberdynecorp.github.io/svelte_components_library/iframe.html";
    expect(new URL(widgetsHref, page).href).toBe(
      "https://cyberdynecorp.github.io/svelte_components_library/cesium/Widgets/widgets.css",
    );
  });
});
