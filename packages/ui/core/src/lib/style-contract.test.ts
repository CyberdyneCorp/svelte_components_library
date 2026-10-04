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
 * - modal overlays stack on --z-overlay and fixed navigation on --z-nav, so an
 *   open Drawer / Modal / Dialog is never covered by BottomNav.
 * - form field labels take their typography from the --input-label-* tokens,
 *   so a theme (calm) can drop the mono uppercase label style.
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

/** Root selector of each component and the stacking token it must use. */
const LAYERS: [file: string, selector: string, token: string][] = [
  ["layout/Drawer/Drawer.svelte", ".cy-drawer-overlay", "--z-overlay"],
  ["overlay/Modal/Modal.svelte", ".cy-modal-overlay", "--z-overlay"],
  ["feedback/Dialog/Dialog.svelte", ".cy-dialog-overlay", "--z-overlay"],
  ["navigation/BottomNav/BottomNav.svelte", ".cy-bottomnav", "--z-nav"],
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

  it.each(LAYERS)("stacks %s on its layer token", (file, selector, token) => {
    const rule = rules.find((r) => r.file === file && r.selector === selector);
    expect(rule?.body).toMatch(new RegExp(`z-index\\s*:\\s*var\\(${token}\\)`));
  });
});

/** Every form field label rule; each one must take its typography from tokens. */
const FORM_LABELS: [file: string, selector: string][] = [
  ["forms/TextInput/TextInput.svelte", ".cy-text-input__label"],
  ["forms/Select/Select.svelte", ".cy-select__label"],
  ["forms/NumberInput/NumberInput.svelte", ".cy-ni__label"],
  ["forms/MoneyInput/MoneyInput.svelte", ".cy-mi__label"],
  ["forms/PasswordInput/PasswordInput.svelte", ".cy-password__label"],
  ["forms/Textarea/Textarea.svelte", ".cy-textarea__label"],
  ["forms/DatePicker/DatePicker.svelte", ".cy-dp__label"],
  ["forms/DateRangePicker/DateRangePicker.svelte", ".cy-drp__label"],
  ["forms/TimePicker/TimePicker.svelte", ".cy-tp__label"],
  ["forms/ComboBox/ComboBox.svelte", ".cy-cb__label"],
  ["forms/MultiSelect/MultiSelect.svelte", ".cy-ms__label"],
  ["forms/TagInput/TagInput.svelte", ".cy-ti__label"],
  ["forms/RangeSlider/RangeSlider.svelte", ".cy-rs__label"],
  ["forms/CodeEditor/CodeEditor.svelte", ".cy-ce__label"],
  ["forms/ColorPicker/ColorPicker.svelte", ".cy-color-picker__label"],
  ["forms/ScheduleConfig/ScheduleConfig.svelte", ".cy-sched__label"],
  ["forms/ScheduleConfig/ScheduleConfig.svelte", ".cy-sched__field-label"],
  ["trading/order/LeverageSlider.svelte", ".cy-lev__label"],
  ["trading/order/SegmentedRadio.svelte", ".cy-seg__legend"],
];

const LABEL_TOKENS: [property: string, token: string][] = [
  ["font-family", "--input-label-font"],
  ["text-transform", "--input-label-transform"],
  ["letter-spacing", "--input-label-letter-spacing"],
];

/** Label typography declarations that do not use their --input-label-* token. */
function hardCodedLabelTypography(body: string): string[] {
  return LABEL_TOKENS.flatMap(([property, token]) => {
    const value = new RegExp(`(^|[;\\s])${property}\\s*:\\s*([^;]+);`).exec(body)?.[2].trim();
    return value !== undefined && value !== `var(${token})` ? [`${property}: ${value}`] : [];
  });
}

describe("form label typography contract", () => {
  it.each(FORM_LABELS)("%s %s uses the --input-label-* tokens", (file, selector) => {
    const rule = rules.find((r) => r.file === file && r.selector === selector);
    expect(rule, `${file} ${selector}`).toBeDefined();
    for (const [property, token] of LABEL_TOKENS) {
      expect(rule?.body, property).toMatch(new RegExp(`${property}\\s*:\\s*var\\(${token}\\)`));
    }
    expect(hardCodedLabelTypography(rule?.body ?? "")).toEqual([]);
  });

  it("never hard-codes font-family, text-transform or letter-spacing on a label painted with --input-label", () => {
    const labels = rules.filter((r) => /color\s*:\s*var\(--input-label\)/.test(r.body));
    expect(labels.length).toBeGreaterThan(0);
    const offenders = labels.flatMap((r) =>
      hardCodedLabelTypography(r.body).map((decl) => `${describeRule(r)} → ${decl}`),
    );
    expect(offenders).toEqual([]);
  });

  it("flags a hard-coded label declaration", () => {
    expect(
      hardCodedLabelTypography(
        "font-family: var(--font-mono); letter-spacing: 0.04em; text-transform: var(--input-label-transform);",
      ),
    ).toEqual(["font-family: var(--font-mono)", "letter-spacing: 0.04em"]);
  });
});
