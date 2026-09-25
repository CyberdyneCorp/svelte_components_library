#!/usr/bin/env node
/**
 * Pre-publish check for @cyberdynecorp/svelte-ui-core: inspect what `npm pack`
 * would ship (after `pnpm build`) and fail if the tarball contains test files,
 * stories or test data, or if a shipped module imports a file that is not
 * shipped (i.e. something the `files` exclusions dropped).
 *
 * Usage:
 *   node scripts/check-package-contents.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkgDir = join(root, "packages/ui/core");

const FORBIDDEN = /\.(test|stories)\.|(^|\/)_testdata\//;
const MODULE = /\.(js|svelte|d\.ts)$/;
const RELATIVE_IMPORT = /(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']+)["']/g;

function packedFiles() {
  const out = execFileSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: pkgDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return new Set(JSON.parse(out)[0].files.map((f) => f.path));
}

function resolves(shipped, from, specifier) {
  const target = normalize(join(dirname(from), specifier));
  return [target, `${target}.js`, `${target}/index.js`, `${target}.d.ts`].some((c) =>
    shipped.has(c),
  );
}

function unresolvedImports(shipped) {
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

const shipped = packedFiles();
if (!shipped.has("dist/index.js")) {
  console.error("check-package-contents: dist/index.js missing — run `pnpm build` first");
  process.exit(1);
}

const problems = [
  ...[...shipped].filter((f) => FORBIDDEN.test(f)).map((f) => `ships non-runtime file ${f}`),
  ...unresolvedImports(shipped),
];

if (problems.length > 0) {
  console.error(`check-package-contents: ${problems.length} problem(s)`);
  for (const p of problems.slice(0, 50)) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`check-package-contents: ${shipped.size} files, no tests/stories, all imports resolve`);
