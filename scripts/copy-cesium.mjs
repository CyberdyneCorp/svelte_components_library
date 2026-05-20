#!/usr/bin/env node
/**
 * Copy Cesium's static runtime assets (Workers, Assets, ThirdParty, Widgets,
 * Cesium.js) into `.storybook/public/cesium/` so Storybook serves them at
 * `/cesium/*`.
 *
 * Consumers of @cyberdynecorp/svelte-ui-core need the equivalent step in
 * their own build pipeline — see documentation/CESIUM_ROADMAP.md §6.
 *
 * Why a script (not a Vite plugin): vite-plugin-cesium's `closeBundle` hook
 * has historically been unreliable under SvelteKit / Storybook pipelines.
 * A standalone script is deterministic and has no plugin coupling.
 */
import { cpSync, existsSync, mkdirSync, rmSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// Resolve cesium from the workspace package that declares it as a (peer)
// dependency. The root has no direct dep on cesium under pnpm.
const searchRoots = [
  join(root, "packages", "ui", "core", "package.json"),
  join(root, "package.json"),
];

let cesiumPkgPath;
let lastErr;
for (const anchor of searchRoots) {
  try {
    const req = createRequire(pathToFileURL(anchor));
    cesiumPkgPath = req.resolve("cesium/package.json");
    break;
  } catch (e) {
    lastErr = e;
  }
}
if (!cesiumPkgPath) {
  console.error("copy-cesium: cesium is not installed.", lastErr);
  process.exit(1);
}

const cesiumRoot = dirname(realpathSync(cesiumPkgPath));
const src = join(cesiumRoot, "Build", "Cesium");
const dst = join(root, ".storybook", "public", "cesium");

if (!existsSync(src)) {
  console.error(`copy-cesium: cesium Build/Cesium directory not found at ${src}`);
  process.exit(1);
}

rmSync(dst, { recursive: true, force: true });
mkdirSync(dst, { recursive: true });

const entries = ["Workers", "Assets", "ThirdParty", "Widgets", "Cesium.js"];
for (const name of entries) {
  const from = join(src, name);
  if (!existsSync(from)) continue;
  cpSync(from, join(dst, name), { recursive: true, force: true });
}

console.log(`copy-cesium: copied ${entries.join(", ")} → ${dst}`);
