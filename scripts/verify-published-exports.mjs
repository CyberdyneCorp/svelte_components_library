#!/usr/bin/env node
/**
 * Post-publish smoke check: download the just-published @cyberdynecorp/svelte-ui-core
 * tarball straight from the registry and assert that the version's expected
 * exports actually exist in `dist/index.d.ts` (and that the cesium/ dist tree
 * is present). Guards against the "version bumped but the tarball is a stale
 * build" class of regression we hit on 0.2.0 and (falsely feared) 0.5.0.
 *
 * Usage:
 *   node scripts/verify-published-exports.mjs <version>
 *
 * Reads the registry token from one of (first set wins):
 *   NODE_AUTH_TOKEN, NPM_GITHUB_TOKEN, GITHUB_TOKEN
 *
 * Expected exports are derived from the changesets being published: we read
 * every export NAME currently in src/lib/index.ts and require each to appear
 * in the published dist/index.d.ts. That way the check tracks the source
 * automatically — no hand-maintained allowlist to drift.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const PKG = "@cyberdynecorp/svelte-ui-core";
const REGISTRY = "https://npm.pkg.github.com";

const version = process.argv[2];
if (!version) {
  console.error("usage: verify-published-exports.mjs <version>");
  process.exit(2);
}

const token =
  process.env.NODE_AUTH_TOKEN ||
  process.env.NPM_GITHUB_TOKEN ||
  process.env.GITHUB_TOKEN;
if (!token) {
  console.error(
    "verify-published-exports: no registry token (NODE_AUTH_TOKEN / NPM_GITHUB_TOKEN / GITHUB_TOKEN)",
  );
  process.exit(2);
}

// Collect the export symbol names from the source barrel — these are what the
// published artifact MUST contain.
const barrel = readFileSync(
  join(root, "packages/ui/core/src/lib/index.ts"),
  "utf8",
);
const expected = new Set();
for (const m of barrel.matchAll(/export\s+\{([^}]*)\}/g)) {
  for (const raw of m[1].split(",")) {
    const name = raw
      .replace(/\btype\b/, "")
      .trim()
      .split(/\s+as\s+/)[0]
      .trim();
    if (name) expected.add(name);
  }
}

const work = mkdtempSync(join(tmpdir(), "cy-verify-"));
try {
  const npmrc = join(work, ".npmrc");
  writeFileSync(
    npmrc,
    `@cyberdynecorp:registry=${REGISTRY}\n//npm.pkg.github.com/:_authToken=${token}\n`,
  );
  const env = { ...process.env, NPM_CONFIG_USERCONFIG: npmrc };

  // Resolve + download the exact published tarball.
  const tarball = execFileSync(
    "npm",
    ["view", `${PKG}@${version}`, "dist.tarball"],
    { env, encoding: "utf8" },
  ).trim();
  if (!tarball) throw new Error(`could not resolve tarball for ${PKG}@${version}`);
  console.log(`verify-published-exports: ${PKG}@${version}\n  ${tarball}`);

  execFileSync("curl", [
    "-sfL",
    "-H",
    `Authorization: Bearer ${token}`,
    tarball,
    "-o",
    join(work, "pkg.tgz"),
  ]);
  execFileSync("tar", ["xzf", join(work, "pkg.tgz"), "-C", work]);

  const dts = readFileSync(join(work, "package/dist/index.d.ts"), "utf8");

  const missing = [...expected].filter((name) => !dts.includes(name));
  if (missing.length > 0) {
    console.error(
      `\n❌ Published ${PKG}@${version} is missing ${missing.length} expected export(s) in dist/index.d.ts:`,
    );
    for (const n of missing) console.error(`   - ${n}`);
    console.error(
      "\nThis usually means the published tarball is a stale build. Re-cut from current main.",
    );
    process.exit(1);
  }

  // Spot-check that the cesium/ dist tree shipped (largest category; the one
  // that went missing in 0.2.0).
  const listing = execFileSync("tar", ["tzf", join(work, "pkg.tgz")], {
    encoding: "utf8",
  });
  if (!listing.includes("package/dist/cesium/CesiumGlobe/")) {
    console.error(
      `\n❌ Published ${PKG}@${version} is missing dist/cesium/ — stale build.`,
    );
    process.exit(1);
  }

  console.log(
    `\n✅ ${PKG}@${version}: all ${expected.size} barrel exports present in dist/index.d.ts; cesium/ tree shipped.`,
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}
