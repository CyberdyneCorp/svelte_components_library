import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Core ships `.svelte` sources that consumers compile with their own Svelte,
 * and the peer range is `svelte: ^5.0.0`. Syntax added in later 5.x minors
 * breaks consumers on older 5.x, so published components must not use it
 * unless the peer range is raised first.
 */

const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8"));

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const published = walk(here).filter((f) => f.endsWith(".svelte") && !f.endsWith(".stories.svelte"));

const LATER_SYNTAX: [string, RegExp][] = [
  ["$props.id() (5.20)", /\$props\.id\(/],
  ["{@attach} (5.29)", /\{@attach\s/],
];

describe("svelte peer range compatibility", () => {
  it("keeps the peer range at ^5.0.0", () => {
    expect(pkg.peerDependencies.svelte).toBe("^5.0.0");
  });

  it("uses no syntax newer than the peer range in published components", () => {
    const offenders = published.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return LATER_SYNTAX.filter(([, re]) => re.test(source)).map(
        ([name]) => `${file.slice(here.length + 1)}: ${name}`,
      );
    });
    expect(offenders).toEqual([]);
  });
});
