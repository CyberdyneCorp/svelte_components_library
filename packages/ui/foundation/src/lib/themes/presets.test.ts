import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Guards for every theme preset in themes/*.css (calm and the design-style
 * presets):
 * - completeness: every Layer 2 + Layer 3 token of the default :root block
 *   (all but primitives and the theme-invariant --video-*) and every
 *   shape/type style token has a preset value;
 * - scope: presets only set tokens foundation defines, never primitives or
 *   --video-*;
 * - contrast: every declared pairing meets WCAG AA (4.5:1 text, 3:1 UI), and
 *   text drawn on a gradient meets 4.5:1 on every opaque #rrggbb stop;
 * - brand states: an opaque --gradient-brand has distinct hover / active
 *   gradients, so the brand button's state colours stay visible;
 * - motion: every --transition-* is ≤ 200ms and never overshoots.
 */

const here = dirname(fileURLToPath(import.meta.url));
const readStyle = (name: string) => readFileSync(join(here, "../styles", name), "utf8");
const colorsCss = readStyle("colors.css");

/** Preset file → the data-theme ids it defines. */
const PRESETS: Record<string, string[]> = {
  calm: ["calm", "calm-dark"],
  minimal: ["minimal"],
  flat: ["flat"],
  material: ["material"],
  swiss: ["swiss"],
  organic: ["organic"],
  maximalism: ["maximalism"],
  y2k: ["y2k"],
  glass: ["glass"],
  neumorphism: ["neumorphism"],
  skeuomorphism: ["skeuomorphism"],
  brutalism: ["brutalism"],
  bento: ["bento"],
  clay: ["clay"],
  memphis: ["memphis"],
  vaporwave: ["vaporwave"],
  "art-deco": ["art-deco"],
  editorial: ["editorial"],
};

type Decls = Map<string, string>;

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function rules(css: string): { selectors: string[]; body: string }[] {
  return [...stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, sel, body]) => ({
    // Drop any preceding at-statement (e.g. an `@import …;` before the first rule).
    selectors: (sel.split(";").at(-1) ?? "").split(",").map((s) => s.trim()),
    body,
  }));
}

function declarations(body: string): Decls {
  const decls: Decls = new Map();
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    decls.set(name, value.trim());
  }
  return decls;
}

/** Declarations that apply to an element carrying `selector` (later rules win). */
function declarationsFor(css: string, selector: string): Decls {
  const merged: Decls = new Map();
  for (const rule of rules(css).filter((r) => r.selectors.includes(selector))) {
    for (const [name, value] of declarations(rule.body)) merged.set(name, value);
  }
  return merged;
}

const presetCss = Object.fromEntries(
  Object.keys(PRESETS).map((file) => [file, readFileSync(join(here, `${file}.css`), "utf8")]),
);
const THEMES = Object.entries(PRESETS).flatMap(([file, ids]) => ids.map((id) => ({ file, id })));
const themeDecls: Record<string, Decls> = Object.fromEntries(
  THEMES.map(({ file, id }) => [id, declarationsFor(presetCss[file], `[data-theme="${id}"]`)]),
);

/** Layer 2 + Layer 3 names of the default theme. */
const themedTokens = [...declarationsFor(colorsCss, ":root").keys()].filter(
  (name) => !name.startsWith("--primitive-") && !name.startsWith("--video-"),
);

/** Shape and type style tokens (radius.css / typography.css) every preset sets. */
const SHAPE_TYPE_TOKENS = [
  "--border-width",
  "--border-width-strong",
  "--border-style",
  "--font-decorative",
  "--heading-transform",
];

/** Every custom property foundation defines on :root. */
const foundationTokens = new Set(
  ["colors.css", "radius.css", "typography.css", "spacing.css", "animations.css"].flatMap(
    (name) => [...declarationsFor(readStyle(name), ":root").keys()],
  ),
);

/** Follow var() chains within one theme until a literal value is reached. */
function resolve(decls: Decls, token: string, seen: string[] = []): string {
  const value = decls.get(token);
  if (value === undefined) throw new Error(`${token} is not defined`);
  if (seen.includes(token)) throw new Error(`cycle: ${[...seen, token].join(" -> ")}`);
  const ref = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value);
  return ref ? resolve(decls, ref[1], [...seen, token]) : value;
}

function channel(hex: string): number {
  const c = parseInt(hex, 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(color: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
  if (!match) throw new Error(`expected an opaque #rrggbb colour, got "${color}"`);
  const [r, g, b] = match.slice(1).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

type Kind = "text" | "ui";
interface Pairing {
  fg: string;
  bg: string;
  kind: Kind;
}
const MIN_RATIO: Record<Kind, number> = { text: 4.5, ui: 3 };

const cross = (fgs: string[], bgs: string[], kind: Kind): Pairing[] =>
  fgs.flatMap((fg) => bgs.map((bg) => ({ fg, bg, kind })));

const readingSurfaces = [
  "--color-bg-primary",
  "--color-bg-secondary",
  "--color-bg-elevated",
  "--color-surface-default",
  "--color-surface-raised",
  "--color-surface-overlay",
  "--color-surface-hover",
  "--card-bg",
  "--nav-bg",
  "--table-header-bg",
  "--table-row-bg",
  "--table-row-hover",
];
const bodyText = [
  "--color-text-primary",
  "--color-text-secondary",
  "--color-text-tertiary",
  "--color-text-link",
  "--color-text-code",
  "--color-syntax-number",
];
const states = ["success", "warning", "error", "info"];
const trades = ["long", "short"];
const uiSurfaces = ["--color-bg-primary", "--color-surface-default", "--color-surface-raised"];

/** Every foreground/background pairing the calm themes promise to keep legible. */
const PAIRINGS: Pairing[] = [
  ...cross(bodyText, readingSurfaces, "text"),
  ...cross(
    ["--color-text-primary", "--color-text-secondary"],
    ["--color-bg-tertiary", "--color-surface-active"],
    "text",
  ),
  ...cross(["--color-text-inverse"], ["--color-text-primary"], "text"),
  ...cross(
    ["--color-action-brand-text"],
    ["--color-action-brand-default", "--color-action-brand-hover", "--color-action-brand-active"],
    "text",
  ),
  ...cross(
    ["--color-action-secondary-text"],
    [
      "--color-action-secondary-default",
      "--color-action-secondary-hover",
      "--color-action-secondary-active",
    ],
    "text",
  ),
  ...cross(
    ["--color-action-tertiary-text"],
    [
      "--color-action-tertiary-default",
      "--color-action-tertiary-hover",
      "--color-action-tertiary-active",
    ],
    "text",
  ),
  ...cross(
    ["--color-action-danger-text"],
    [
      "--color-action-danger-default",
      "--color-action-danger-hover",
      "--color-action-danger-active",
    ],
    "text",
  ),
  ...cross(["--color-action-brand-default"], ["--color-action-brand-bg", ...uiSurfaces], "text"),
  ...cross(
    ["--color-action-secondary-default"],
    ["--color-action-secondary-bg", ...uiSurfaces],
    "text",
  ),
  ...cross(["--color-action-danger-default"], uiSurfaces, "text"),
  ...states.flatMap((s) =>
    cross([`--color-state-${s}`], [`--color-state-${s}-bg`, ...uiSurfaces], "text"),
  ),
  ...cross(
    ["--color-text-primary"],
    states.map((s) => `--color-state-${s}-bg`),
    "text",
  ),
  ...trades.flatMap((d) =>
    cross([`--color-trade-${d}-text`], [`--color-trade-${d}-bg`, ...uiSurfaces], "text"),
  ),
  ...cross(
    trades.map((d) => `--color-trade-${d}`),
    uiSurfaces,
    "ui",
  ),
  ...cross(
    ["--btn-brand-text"],
    ["--btn-brand-bg", "--btn-brand-bg-hover", "--btn-brand-bg-active"],
    "text",
  ),
  ...cross(["--btn-secondary-text"], ["--btn-secondary-bg", "--btn-secondary-bg-hover"], "text"),
  ...cross(["--btn-danger-text"], ["--btn-danger-bg", "--btn-danger-bg-hover"], "text"),
  ...cross(
    ["--btn-ghost-text", "--btn-ghost-text-hover"],
    ["--color-bg-primary", "--btn-ghost-bg-hover"],
    "text",
  ),
  ...cross(["--input-text", "--input-placeholder"], ["--input-bg", "--input-bg-hover"], "text"),
  ...cross(["--input-label"], ["--color-bg-primary", "--color-surface-default"], "text"),
  ...cross(["--nav-item-text"], ["--nav-bg", "--nav-item-hover"], "text"),
  ...cross(
    ["--nav-item-text-active"],
    ["--nav-bg", "--nav-item-hover", "--nav-item-active"],
    "text",
  ),
  ...cross(
    ["--color-border-focus", "--input-border-focus"],
    [...uiSurfaces, "--color-surface-hover", "--input-bg"],
    "ui",
  ),
  ...cross(
    ["--input-border", "--input-border-error"],
    ["--input-bg", "--input-bg-hover", ...uiSurfaces],
    "ui",
  ),
  ...cross(["--color-border-strong", "--btn-secondary-border"], uiSurfaces, "ui"),
  ...cross(["--color-border-brand"], uiSurfaces, "ui"),
  ...cross(
    [
      "--color-accent-green",
      "--color-accent-cyan",
      "--color-accent-violet",
      "--color-accent-1",
      "--color-accent-2",
      "--color-accent-3",
      "--color-accent-4",
    ],
    uiSurfaces,
    "ui",
  ),
];

function contrastFailures(theme: string): string[] {
  const decls = themeDecls[theme];
  return PAIRINGS.flatMap(({ fg, bg, kind }) => {
    const ratio = contrast(resolve(decls, fg), resolve(decls, bg));
    return ratio >= MIN_RATIO[kind]
      ? []
      : [`${fg} on ${bg}: ${ratio.toFixed(2)} < ${MIN_RATIO[kind]}`];
  });
}

/**
 * Text drawn directly on a gradient token. --gradient-accent is absent on
 * purpose: Tabs paints it only as a decorative strip on the active underline,
 * never under a label.
 */
const GRADIENT_TEXT: Record<string, string[]> = {
  "--gradient-brand": ["--btn-brand-text"],
  "--gradient-brand-hover": ["--btn-brand-text"],
  "--gradient-brand-active": ["--btn-brand-text"],
};

/** Split a background value into its top-level comma-separated layers. */
function layers(value: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      out.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(value.slice(start).trim());
  return out.filter((layer) => layer !== "" && layer !== "none");
}

/** The opaque #rrggbb colour stops of a gradient value. */
function opaqueStops(value: string): string[] {
  return [...value.matchAll(/#[0-9a-f]{6}\b/gi)].map(([hex]) => hex.toLowerCase());
}

/** True when some layer is built only from opaque stops, hiding everything below it. */
function hasOpaqueLayer(value: string): boolean {
  return layers(value).some(
    (layer) =>
      opaqueStops(layer).length > 0 &&
      !/rgba\(|hsla\(|transparent|#[0-9a-f]{3,4}\b|#[0-9a-f]{8}\b/i.test(layer),
  );
}

function gradientTextFailures(decls: Decls): string[] {
  return Object.entries(GRADIENT_TEXT).flatMap(([gradient, texts]) =>
    texts.flatMap((text) => {
      const fg = resolve(decls, text);
      return opaqueStops(resolve(decls, gradient)).flatMap((stop) => {
        const ratio = contrast(fg, stop);
        return ratio >= MIN_RATIO.text
          ? []
          : [`${text} on ${gradient} stop ${stop}: ${ratio.toFixed(2)} < ${MIN_RATIO.text}`];
      });
    }),
  );
}

/** An opaque brand gradient hides the hover / active colours unless the states swap it. */
function brandStateFailures(decls: Decls): string[] {
  const rest = resolve(decls, "--gradient-brand");
  if (!hasOpaqueLayer(rest)) return [];
  const hover = resolve(decls, "--gradient-brand-hover");
  const active = resolve(decls, "--gradient-brand-active");
  return [
    ...(hover === rest ? ["--gradient-brand-hover equals the opaque --gradient-brand"] : []),
    ...(active === rest ? ["--gradient-brand-active equals the opaque --gradient-brand"] : []),
    ...(active === hover ? ["--gradient-brand-active equals --gradient-brand-hover"] : []),
  ];
}

const SAFE_NAMED_EASINGS = new Set(["ease", "ease-in", "ease-out", "ease-in-out", "linear"]);

function durationMs(value: string): number {
  const match = /(\d*\.?\d+)(ms|s)\b/.exec(value);
  if (!match) throw new Error(`no duration in "${value}"`);
  return Number(match[1]) * (match[2] === "s" ? 1000 : 1);
}

/** True when the timing function stays within [0, 1] (no spring/bounce). */
function isMonotonicEasing(value: string): boolean {
  const bezier = /cubic-bezier\(([^)]+)\)/.exec(value);
  if (!bezier) return value.split(/\s+/).some((part) => SAFE_NAMED_EASINGS.has(part));
  const [, y1, , y2] = bezier[1].split(",").map(Number);
  return [y1, y2].every((y) => y >= 0 && y <= 1);
}

describe("theme presets", () => {
  it("derives the default Layer 2 + 3 token list from colors.css", () => {
    expect(themedTokens).toContain("--color-bg-primary");
    expect(themedTokens).toContain("--nav-height");
    expect(themedTokens).toContain("--color-action-danger-text");
    expect(themedTokens).toContain("--gradient-brand");
    for (const suffix of ["", "-bg", "-text"]) {
      expect(themedTokens).toContain(`--color-trade-long${suffix}`);
      expect(themedTokens).toContain(`--color-trade-short${suffix}`);
    }
    expect(themedTokens.some((t) => t.startsWith("--video-"))).toBe(false);
  });

  it("covers every preset file in themes/", () => {
    const files = readdirSync(here)
      .filter((name) => name.endsWith(".css"))
      .map((name) => name.replace(/\.css$/, ""));
    expect(files.sort()).toEqual(Object.keys(PRESETS).sort());
  });

  it("exports every preset file from the package", () => {
    const pkg = JSON.parse(readFileSync(join(here, "../../../package.json"), "utf8")) as {
      exports: Record<string, unknown>;
    };
    for (const file of Object.keys(PRESETS)) {
      expect(pkg.exports[`./themes/${file}.css`], file).toBe(`./src/lib/themes/${file}.css`);
    }
  });

  describe.each(THEMES)("$id", ({ id: theme }) => {
    it("defines every Layer 2 and Layer 3 token of the default theme", () => {
      const missing = themedTokens.filter((token) => !themeDecls[theme].has(token));
      expect(missing).toEqual([]);
    });

    it("defines every shape and type style token", () => {
      const missing = SHAPE_TYPE_TOKENS.filter((token) => !themeDecls[theme].has(token));
      expect(missing).toEqual([]);
    });

    it("only sets tokens foundation defines", () => {
      const unknown = [...themeDecls[theme].keys()].filter((name) => !foundationTokens.has(name));
      expect(unknown).toEqual([]);
    });

    it("does not redefine primitives or the theme-invariant video tokens", () => {
      const forbidden = [...themeDecls[theme].keys()].filter(
        (name) => name.startsWith("--primitive-") || name.startsWith("--video-"),
      );
      expect(forbidden).toEqual([]);
    });

    it("meets WCAG AA for every declared pairing", () => {
      expect(contrastFailures(theme)).toEqual([]);
    });

    it("keeps text on opaque gradient stops at 4.5:1", () => {
      expect(gradientTextFailures(themeDecls[theme])).toEqual([]);
    });

    it("gives the brand button visible hover and active states", () => {
      expect(brandStateFailures(themeDecls[theme])).toEqual([]);
    });

    it("keeps motion calm: ≤ 200ms and no overshoot", () => {
      const transitions = [...themeDecls[theme]].filter(([name]) =>
        name.startsWith("--transition-"),
      );
      expect(transitions.map(([name]) => name).sort()).toEqual([
        "--transition-default",
        "--transition-fast",
        "--transition-slow",
        "--transition-spring",
      ]);
      for (const [name, value] of transitions) {
        expect(durationMs(value), name).toBeLessThanOrEqual(200);
        expect(isMonotonicEasing(value), name).toBe(true);
      }
    });

    it("declares its color-scheme", () => {
      const file = THEMES.find((t) => t.id === theme)?.file ?? "";
      const body = rules(presetCss[file])
        .filter((r) => r.selectors.includes(`[data-theme="${theme}"]`))
        .map((r) => r.body)
        .join(";");
      expect(body).toMatch(/color-scheme\s*:\s*(light|dark)\s*;/);
    });
  });

  it.each(["calm", "calm-dark"])("%s uses Inter as the display font", (theme) => {
    expect(themeDecls[theme].get("--font-display")).toMatch(/^"Inter"/);
  });

  describe("guards", () => {
    it("fails completeness when a semantic token has no preset value", () => {
      const partial = new Map(themeDecls.calm);
      partial.delete("--color-action-danger-hover");
      expect(themedTokens.filter((t) => !partial.has(t))).toEqual(["--color-action-danger-hover"]);
    });

    it("computes WCAG ratios correctly", () => {
      expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
      expect(contrast("#2b2f2c", "#f7f5f0")).toBeCloseTo(12.47, 1);
    });

    it("resolves var() chains and rejects non-opaque colours", () => {
      const decls: Decls = new Map([
        ["--a", "var(--b)"],
        ["--b", "#ffffff"],
        ["--c", "rgba(0, 0, 0, 0.5)"],
      ]);
      expect(resolve(decls, "--a")).toBe("#ffffff");
      expect(() => luminance(resolve(decls, "--c"))).toThrow(/opaque/);
      expect(() => resolve(decls, "--missing")).toThrow(/not defined/);
    });

    it("extracts opaque gradient stops and flags a label that disappears on them", () => {
      const decls: Decls = new Map([
        ["--btn-brand-text", "#ffffff"],
        ["--gradient-brand", "linear-gradient(90deg, #1d3fd6 0%, rgba(0, 0, 0, 0.2) 100%)"],
        ["--gradient-brand-hover", "linear-gradient(90deg, #ffffff 0%, #1d3fd6 100%)"],
        ["--gradient-brand-active", "none"],
      ]);
      expect(opaqueStops(resolve(decls, "--gradient-brand"))).toEqual(["#1d3fd6"]);
      expect(gradientTextFailures(decls)).toEqual([
        "--btn-brand-text on --gradient-brand-hover stop #ffffff: 1.00 < 4.5",
      ]);
    });

    it("flags an opaque brand gradient that hides the hover / active colours", () => {
      const opaque = "linear-gradient(135deg, #ff71ce 0%, #b967ff 100%)";
      const sheen = "linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0))";
      expect(hasOpaqueLayer(opaque)).toBe(true);
      expect(hasOpaqueLayer(sheen)).toBe(false);
      expect(hasOpaqueLayer(`${sheen}, ${opaque}`)).toBe(true);
      const decls: Decls = new Map([
        ["--gradient-brand", opaque],
        ["--gradient-brand-hover", "var(--gradient-brand)"],
        ["--gradient-brand-active", "linear-gradient(135deg, #ffa3de 0%, #d29dff 100%)"],
      ]);
      expect(brandStateFailures(decls)).toEqual([
        "--gradient-brand-hover equals the opaque --gradient-brand",
      ]);
      decls.set("--gradient-brand", sheen);
      expect(brandStateFailures(decls)).toEqual([]);
    });

    it("flags overshooting and slow motion", () => {
      expect(isMonotonicEasing("300ms cubic-bezier(0.34, 1.56, 0.64, 1)")).toBe(false);
      expect(isMonotonicEasing("180ms ease-out")).toBe(true);
      expect(durationMs("0.3s ease")).toBe(300);
    });
  });
});
