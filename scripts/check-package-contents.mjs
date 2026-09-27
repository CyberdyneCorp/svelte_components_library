#!/usr/bin/env node
/**
 * Pre-publish check for the published packages. Build the real tarball with
 * `pnpm pack` (the same packer `changeset publish` uses — npm's packlist
 * honours some `files` negations that pnpm ignores) and fail if it contains
 * tests, stories or test data, or if a shipped module imports a relative path
 * that is not shipped.
 *
 * Run after `pnpm build`.
 *
 * Usage:
 *   node scripts/check-package-contents.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const PACKAGES = [
  { dir: "packages/ui/core", mustShip: "dist/index.js" },
  { dir: "packages/ui/foundation", mustShip: "src/lib/index.ts" },
];

const FORBIDDEN = /\.(test|stories)\.|(^|\/)_testdata\//;
const MODULE = /\.(js|ts|svelte)$/;
const RELATIVE_IMPORT = /(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']+)["']/g;

function packedFiles(pkgDir) {
  const out = mkdtempSync(join(tmpdir(), "pack-"));
  try {
    execFileSync("pnpm", ["pack", "--pack-destination", out], { cwd: pkgDir, stdio: "ignore" });
    const tarball = join(out, readdirSync(out)[0]);
    const listing = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" });
    return new Set(listing.split("\n").filter(Boolean).map((p) => p.replace(/^package\//, "")));
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

function resolves(shipped, from, specifier) {
  const target = normalize(join(dirname(from), specifier));
  const tsSource = target.replace(/\.js$/, ".ts");
  return [target, tsSource, `${target}.js`, `${target}.ts`, `${target}/index.js`, `${target}/index.ts`]
    .some((candidate) => shipped.has(candidate));
}

function unresolvedImports(pkgDir, shipped) {
  const problems = [];
  for (const file of shipped) {
    if (!MODULE.test(file)) continue;
    const source = readFileSync(join(pkgDir, file), "utf8");
    for (const [, specifier] of source.matchAll(RELATIVE_IMPORT)) {
      if (!resolves(shipped, file, specifier)) problems.push(`${file} imports missing ${specifier}`);
    }
  }
  return problems;
}

function checkPackage({ dir, mustShip }) {
  const pkgDir = join(root, dir);
  const shipped = packedFiles(pkgDir);
  if (!shipped.has(mustShip)) return { dir, shipped, problems: [`${mustShip} missing — run \`pnpm build\` first`] };
  const problems = [
    ...[...shipped].filter((f) => FORBIDDEN.test(f)).map((f) => `ships non-runtime file ${f}`),
    ...unresolvedImports(pkgDir, shipped),
  ];
  return { dir, shipped, problems };
}

let failed = false;
for (const result of PACKAGES.map(checkPackage)) {
  if (result.problems.length === 0) {
    console.log(`check-package-contents: ${result.dir}: ${result.shipped.size} files, no tests/stories, all imports resolve`);
    continue;
  }
  failed = true;
  console.error(`check-package-contents: ${result.dir}: ${result.problems.length} problem(s)`);
  for (const p of result.problems.slice(0, 50)) console.error(`  ${p}`);
}
process.exit(failed ? 1 : 0);
