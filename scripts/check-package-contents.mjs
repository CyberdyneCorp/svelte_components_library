#!/usr/bin/env node
/**
 * Pre-publish check for the published @cyberdynecorp packages: inspect what
 * `pnpm pack` would ship (after `pnpm build`) and fail if a tarball contains
 * test files, stories or test data, misses a file its `exports` map points at,
 * or ships a module that imports a file that is not shipped.
 *
 * Packs with pnpm, not npm: `changeset publish` runs `pnpm publish` in this
 * workspace, and pnpm 9 ignores `files` negations under a nested directory
 * (`"src/lib", "!src/lib/**\/*.test.ts"`) that npm honours. Checking with npm
 * let foundation 0.4.0 and 0.5.0 ship their tests.
 *
 * Usage:
 *   node scripts/check-package-contents.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const PACKAGES = ["packages/ui/core", "packages/ui/foundation"];

const FORBIDDEN = /\.(test|stories)\.|(^|\/)_testdata\/|(^|\/)stories\//;
const MODULE = /\.(js|ts|svelte)$/;
const RELATIVE_IMPORT = /(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']+)["']/g;
const EXTENSIONS = ["", ".js", ".ts", ".d.ts", "/index.js", "/index.ts"];

function packedFiles(pkgDir) {
  const dest = mkdtempSync(join(tmpdir(), "check-package-"));
  try {
    const out = execFileSync("pnpm", ["pack", "--json", "--pack-destination", dest], {
      cwd: pkgDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return new Set(JSON.parse(out).files.map((f) => f.path));
  } finally {
    rmSync(dest, { recursive: true, force: true });
  }
}

function exportTargets(value) {
  if (typeof value === "string") return value.includes("*") ? [] : [normalize(value)];
  if (value && typeof value === "object") return Object.values(value).flatMap(exportTargets);
  return [];
}

function resolves(shipped, from, specifier) {
  const target = normalize(join(dirname(from), specifier));
  // TypeScript sources import `./x.js` for a sibling `./x.ts`.
  const tsTarget = target.replace(/\.js$/, ".ts");
  return EXTENSIONS.some(
    (ext) => shipped.has(`${target}${ext}`) || shipped.has(`${tsTarget}${ext}`),
  );
}

function unresolvedImports(pkgDir, shipped) {
  const problems = [];
  for (const file of shipped) {
    if (!MODULE.test(file)) continue;
    const source = readFileSync(join(pkgDir, file), "utf8");
    for (const [, specifier] of source.matchAll(RELATIVE_IMPORT)) {
      if (!resolves(shipped, file, specifier))
        problems.push(`${file} imports missing ${specifier}`);
    }
  }
  return problems;
}

function checkPackage(relDir) {
  const pkgDir = join(root, relDir);
  const { name, exports } = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  const shipped = packedFiles(pkgDir);
  const problems = [
    ...exportTargets(exports)
      .filter((target) => !shipped.has(target))
      .map((target) => `exports ${target}, which is not shipped (run \`pnpm build\` first?)`),
    ...[...shipped].filter((f) => FORBIDDEN.test(f)).map((f) => `ships non-runtime file ${f}`),
    ...unresolvedImports(pkgDir, shipped),
  ];
  return { name, size: shipped.size, problems };
}

let failed = false;
for (const { name, size, problems } of PACKAGES.map(checkPackage)) {
  if (problems.length === 0) {
    console.log(
      `check-package-contents: ${name}: ${size} files, no tests/stories, all exports and imports resolve`,
    );
    continue;
  }
  failed = true;
  console.error(`check-package-contents: ${name}: ${problems.length} problem(s)`);
  for (const p of problems.slice(0, 50)) console.error(`  ${p}`);
}
if (failed) process.exit(1);
