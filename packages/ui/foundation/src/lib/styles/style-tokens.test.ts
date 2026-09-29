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

/** Follow var() chains until a literal value is reached. */
function resolve(decls: Decls, token: string): string {
  const value = decls.get(token);
  if (value === undefined) throw new Error(`${token} is not defined`);
  const ref = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value);
  return ref ? resolve(decls, ref[1]) : value;
}

function luminance(hex: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`expected an opaque #rrggbb colour, got "${hex}"`);
  const [r, g, b] = match.slice(1).map((part) => {
    const c = parseInt(part, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("trade direction tokens", () => {
  const TRADE_TOKENS = ["long", "short"].flatMap((side) =>
    ["", "-bg", "-text"].map((suffix) => `--color-trade-${side}${suffix}`),
  );
  const SURFACES = ["--color-bg-primary", "--color-surface-default", "--color-surface-raised"];
  // The light theme inherits primitives from :root.
  const themes: [string, Decls][] = [
    [":root", rootDecls],
    ["light", new Map([...rootDecls, ...lightDecls])],
  ];

  it("declares every trade token in :root and the light theme", () => {
    for (const name of TRADE_TOKENS) {
      expect(rootDecls.has(name), `:root ${name}`).toBe(true);
      expect(lightDecls.has(name), `light ${name}`).toBe(true);
    }
  });

  it("maps the trade colours onto the success / error primitives", () => {
    expect(rootDecls.get("--color-trade-long")).toBe("var(--primitive-green-10)");
    expect(rootDecls.get("--color-trade-short")).toBe("var(--primitive-red-10)");
    expect(lightDecls.get("--color-trade-long")).toBe("var(--primitive-green-50)");
    expect(lightDecls.get("--color-trade-short")).toBe("var(--primitive-red-30)");
  });

  it.each(themes)("keeps %s trade text at WCAG AA on its surfaces", (_, decls) => {
    const failures = ["long", "short"].flatMap((side) =>
      SURFACES.flatMap((surface) => {
        const fg = `--color-trade-${side}-text`;
        const ratio = contrast(resolve(decls, fg), resolve(decls, surface));
        return ratio >= 4.5 ? [] : [`${fg} on ${surface}: ${ratio.toFixed(2)}`];
      }),
    );
    expect(failures).toEqual([]);
  });
});

describe("stacking layer tokens", () => {
  const spacing = declarationsFor(read("spacing.css"), ":root");

  it("defines --z-nav and --z-overlay as integers", () => {
    expect(spacing.get("--z-nav")).toMatch(/^\d+$/);
    expect(spacing.get("--z-overlay")).toMatch(/^\d+$/);
  });

  it("stacks overlays above fixed navigation", () => {
    expect(Number(spacing.get("--z-overlay"))).toBeGreaterThan(Number(spacing.get("--z-nav")));
  });
});

describe("liquidity component tokens", () => {
  /** Defaults reproduce the pre-token hard-coded look (2px text-primary borders, square corners). */
  const LIQUIDITY_DEFAULTS: Record<string, string> = {
    "--lpos-border": "2px solid var(--color-text-primary)",
    "--lpos-radius": "0",
    "--lrange-track-bg": "var(--color-surface-raised)",
    "--lrange-track-border": "2px solid var(--color-text-primary)",
    "--lrange-radius": "0",
    "--lrange-marker-color": "var(--color-text-primary)",
    "--tpair-ring-border": "2px solid var(--color-text-primary)",
    "--tpair-a-bg": "var(--color-action-brand-default)",
    "--tpair-b-bg": "var(--color-action-secondary-default)",
    "--tpair-initials-color": "var(--color-text-inverse)",
  };

  it.each([
    [":root", rootDecls],
    ["light", lightDecls],
  ])("defaults %s to today's look", (_, decls) => {
    for (const [name, value] of Object.entries(LIQUIDITY_DEFAULTS)) {
      expect(decls.get(name), name).toBe(value);
    }
  });

  it.each(["calm", "calm-dark"])(
    "softens %s: hairline subtle borders, pill track, tinted initials",
    (theme) => {
      const decls = declarationsFor(calmCss, `[data-theme="${theme}"]`);
      for (const name of ["--lpos-border", "--lrange-track-border", "--tpair-ring-border"]) {
        expect(decls.get(name), name).toBe("1px solid var(--color-border-subtle)");
      }
      expect(decls.get("--lrange-radius")).toBe("var(--radius-pill)");
      expect(decls.get("--tpair-a-bg")).toBe("var(--color-action-brand-bg)");
      expect(decls.get("--tpair-b-bg")).toBe("var(--color-action-secondary-bg)");
      expect(decls.get("--tpair-initials-color")).toBe("var(--color-text-primary)");
    },
  );
});

describe("form label tokens", () => {
  /** Defaults reproduce the literals form labels used before the tokens existed. */
  const LABEL_DEFAULTS: Record<string, string> = {
    "--input-label-font": "var(--font-mono)",
    "--input-label-size": "0.8125rem",
    "--input-label-weight": "var(--font-weight-medium)",
    "--input-label-transform": "uppercase",
    "--input-label-letter-spacing": "0.04em",
  };

  /** Calm drops the mono uppercase label for sentence case in the body font. */
  const CALM_LABELS: Record<string, string> = {
    "--input-label-font": "var(--font-body)",
    "--input-label-transform": "none",
    "--input-label-letter-spacing": "normal",
  };

  it("defaults to the mono uppercase label in :root", () => {
    for (const [name, value] of Object.entries(LABEL_DEFAULTS)) {
      expect(rootDecls.get(name), name).toBe(value);
    }
  });

  it.each(["calm", "calm-dark"])(
    "uses the body font, no transform and normal tracking in %s",
    (theme) => {
      const decls = declarationsFor(calmCss, `[data-theme="${theme}"]`);
      for (const [name, value] of Object.entries(CALM_LABELS)) {
        expect(decls.get(name), name).toBe(value);
      }
      // Resolved against calm, the label font is Inter, not the mono stack.
      const font = resolve(new Map([...rootDecls, ...decls]), "--input-label-font");
      expect(font).toMatch(/^"Inter"/);
      expect(font).not.toContain("JetBrains Mono");
    },
  );

  it("keeps size and weight on the defaults in calm", () => {
    const decls = declarationsFor(calmCss, '[data-theme="calm"]');
    expect(decls.has("--input-label-size")).toBe(false);
    expect(decls.has("--input-label-weight")).toBe(false);
  });
});
