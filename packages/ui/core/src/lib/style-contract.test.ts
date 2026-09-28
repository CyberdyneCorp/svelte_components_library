import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Structural guards for how core consumes the design-style tokens. Presets
 * (foundation/src/lib/themes) can only be verified against the ways
 * components actually paint them, so these rules keep that contract honest:
 *
 * - --gradient-accent is decorative only: it is painted on ::before/::after
 *   pseudo-elements, never as the background of an element that holds text.
 * - --gradient-brand is the rest state only; :hover / :active use
 *   --gradient-brand-hover / --gradient-brand-active, so an opaque brand
 *   gradient cannot hide the state colours below it.
 * - hover shadow lists that carry --shadow-offset keep --shadow-raised, so
 *   presets built from raised shadows (neumorphism, clay…) survive hover.
 * - backdrop-filter: var(--surface-blur) is limited to floating overlay
 *   panels. On a container it would become the containing block of every
 *   position: fixed descendant (Dialog, Modal, menus, toasts).
 */

const here = dirname(fileURLToPath(import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

interface Rule {
  file: string;
  selector: string;
  body: string;
}

function styleRules(file: string): Rule[] {
  const source = readFileSync(file, "utf8");
  const styles = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(([, css]) => css);
  return styles.flatMap((css) =>
    [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
      ([, selector, body]) => ({
        file: file.slice(here.length + 1),
        selector: selector.trim(),
        body,
      }),
    ),
  );
}

const rules = walk(here)
  .filter((file) => file.endsWith(".svelte") && !file.endsWith(".stories.svelte"))
  .flatMap(styleRules);

const describeRule = (r: Rule) => `${r.file}: ${r.selector.replace(/\s+/g, " ")}`;

/** Floating overlay panels that may blur what is behind them. */
const BLUR_ALLOWED = [
  "overlay/Modal/Modal.svelte",
  "feedback/Dialog/Dialog.svelte",
  "overlay/Popover/Popover.svelte",
];

describe("design-style token contract", () => {
  it("finds component style rules", () => {
    expect(rules.some((r) => r.file === "primitives/Button/Button.svelte")).toBe(true);
  });

  it("paints --gradient-accent only on decorative pseudo-elements", () => {
    const offenders = rules.filter(
      (r) => r.body.includes("var(--gradient-accent)") && !/::(before|after)/.test(r.selector),
    );
    expect(offenders.map(describeRule)).toEqual([]);
  });

  it("swaps --gradient-brand for its hover / active variants", () => {
    const offenders = rules.filter(
      (r) => /:(hover|active)/.test(r.selector) && r.body.includes("var(--gradient-brand)"),
    );
    expect(offenders.map(describeRule)).toEqual([]);
    const brandHover = rules.find((r) => /\.cy-btn--brand:hover/.test(r.selector));
    const brandActive = rules.find((r) => /\.cy-btn--brand:active/.test(r.selector));
    expect(brandHover?.body).toContain("var(--gradient-brand-hover)");
    expect(brandActive?.body).toContain("var(--gradient-brand-active)");
  });

  it("keeps --shadow-raised in hover shadow lists", () => {
    const offenders = rules.filter((r) => {
      if (!/:hover/.test(r.selector)) return false;
      const shadow = /box-shadow\s*:\s*([^;]+);/.exec(r.body)?.[1] ?? "";
      return shadow.includes("var(--shadow-offset)") && !shadow.includes("var(--shadow-raised)");
    });
    expect(offenders.map(describeRule)).toEqual([]);
  });

  it("limits backdrop-filter: var(--surface-blur) to floating overlay panels", () => {
    const blurred = rules.filter((r) =>
      /(^|[^-])backdrop-filter\s*:\s*var\(--surface-blur\)/.test(r.body),
    );
    const files = [...new Set(blurred.map((r) => r.file))].sort();
    expect(files.filter((file) => !BLUR_ALLOWED.includes(file))).toEqual([]);
  });
});
