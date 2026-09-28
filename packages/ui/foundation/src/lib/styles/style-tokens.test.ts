import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Guards for the design-style token groups (gradients, texture, glass,
 * style shadows, border shape, decorative type, multi-accent). Their defaults
 * must be no-ops so every existing theme renders exactly as before, and the
 * light and calm themes must declare them so subtree theming never inherits
 * a value resolved against another theme.
 */

const here = dirname(fileURLToPath(import.meta.url));
const read = (path: string) =>
  readFileSync(join(here, path), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

type Decls = Map<string, string>;

function declarationsFor(css: string, selector: string): Decls {
  const decls: Decls = new Map();
  for (const [, sel, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    // Drop any preceding at-statement (e.g. typography.css's `@import …;`).
    const selectors = (sel.split(";").at(-1) ?? "").split(",");
    if (!selectors.map((s) => s.trim()).includes(selector)) continue;
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      decls.set(name, value.trim());
    }
  }
  return decls;
}

const NO_SHADOW = "0 0 0 0 transparent";

/** Themed style tokens (colors.css) and their no-op defaults. */
const COLOR_STYLE_DEFAULTS: Record<string, string> = {
  "--gradient-surface": "none",
  "--gradient-brand": "none",
  "--gradient-brand-hover": "none",
  "--gradient-brand-active": "none",
  "--gradient-accent": "none",
  "--gradient-backdrop": "none",
  "--texture-surface": "none",
  "--pattern-backdrop": "none",
  "--surface-blur": "none",
  "--shadow-offset": NO_SHADOW,
  "--shadow-raised": NO_SHADOW,
  "--shadow-pressed": NO_SHADOW,
  "--shadow-inset": NO_SHADOW,
};

/** Shape and type style tokens and their defaults (match pre-existing literals). */
const SHAPE_TYPE_DEFAULTS: Record<string, string> = {
  "--border-width": "1px",
  "--border-width-strong": "2px",
  "--border-style": "solid",
  "--font-decorative": "var(--font-display)",
  "--heading-transform": "none",
};

const ACCENTS = ["--color-accent-1", "--color-accent-2", "--color-accent-3", "--color-accent-4"];

const colorsCss = read("colors.css");
const rootDecls = new Map([
  ...declarationsFor(colorsCss, ":root"),
  ...declarationsFor(read("radius.css"), ":root"),
  ...declarationsFor(read("typography.css"), ":root"),
]);
const lightDecls = declarationsFor(colorsCss, '[data-theme="light"]');
const calmCss = read("../themes/calm.css");

describe("design-style tokens", () => {
  it("defaults every style token to a no-op in :root", () => {
    for (const [name, value] of Object.entries({
      ...COLOR_STYLE_DEFAULTS,
      ...SHAPE_TYPE_DEFAULTS,
    })) {
      expect(rootDecls.get(name), name).toBe(value);
    }
  });

  it("declares every themed style token in :root and the light theme", () => {
    for (const name of [...Object.keys(COLOR_STYLE_DEFAULTS), ...ACCENTS]) {
      expect(rootDecls.has(name), `:root ${name}`).toBe(true);
      expect(lightDecls.has(name), `light ${name}`).toBe(true);
    }
  });

  it("keeps the no-op defaults in the light theme", () => {
    for (const [name, value] of Object.entries(COLOR_STYLE_DEFAULTS)) {
      expect(lightDecls.get(name), name).toBe(value);
    }
  });

  it("maps the multi-accent palette onto the existing accents", () => {
    expect(ACCENTS.map((a) => rootDecls.get(a))).toEqual([
      "var(--color-accent-green)",
      "var(--color-accent-cyan)",
      "var(--color-accent-violet)",
      "var(--primitive-amber-10)",
    ]);
    expect(ACCENTS.map((a) => lightDecls.get(a))).toEqual([
      "var(--color-accent-green)",
      "var(--color-accent-cyan)",
      "var(--color-accent-violet)",
      "var(--primitive-amber-40)",
    ]);
  });

  it.each(["calm", "calm-dark"])("declares shape and type style tokens in %s", (theme) => {
    const decls = declarationsFor(calmCss, `[data-theme="${theme}"]`);
    for (const [name, value] of Object.entries(SHAPE_TYPE_DEFAULTS)) {
      expect(decls.get(name), name).toBe(value);
    }
  });
});
