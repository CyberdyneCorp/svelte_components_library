import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Every `var(--…)` in core that uses a foundation-owned namespace (the
 * prefixes foundation itself defines, e.g. `--color-`, `--space-`, `--nav-`)
 * must resolve to a token foundation defines. An undefined token silently
 * falls back to the browser default or an inline literal, so a theme can
 * never reach it.
 */

const here = dirname(fileURLToPath(import.meta.url));
const coreLib = here;
const foundationStyles = join(here, "../../../foundation/src/lib/styles");

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function definedTokens(files: string[]): Set<string> {
  const defined = new Set<string>();
  for (const file of files) {
    for (const [, name] of readFileSync(file, "utf8").matchAll(/(--[\w-]+)\s*:/g)) {
      defined.add(name);
    }
  }
  return defined;
}

const foundationTokens = definedTokens(walk(foundationStyles));
const namespaces = new Set([...foundationTokens].map((name) => name.split("-")[2]));

function isFoundationNamespace(name: string): boolean {
  return namespaces.has(name.split("-")[2]);
}

const coreSources = walk(coreLib).filter(
  (file) => /\.(svelte|ts|css)$/.test(file) && !/\.test\.ts$/.test(file),
);

function undefinedReferences(): string[] {
  const missing = new Set<string>();
  for (const file of coreSources) {
    for (const [, name] of readFileSync(file, "utf8").matchAll(/var\(\s*(--[\w-]+)/g)) {
      if (isFoundationNamespace(name) && !foundationTokens.has(name)) {
        missing.add(`${name} (${file.slice(coreLib.length + 1)})`);
      }
    }
  }
  return [...missing].sort();
}

describe("design token coverage", () => {
  it("derives the foundation namespaces", () => {
    expect(namespaces).toContain("color");
    expect(namespaces).toContain("space");
  });

  it("every foundation-namespaced var() in core is defined by foundation", () => {
    expect(undefinedReferences()).toEqual([]);
  });
});
