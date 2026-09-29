/**
 * Chart colours from foundation tokens (design D3). The component's CSS maps
 * each `--cy-trading-chart-*` property to a foundation token (with a var()
 * fallback); this module reads their resolved values, because a canvas
 * cannot use var(). The values are re-read when the theme changes.
 */

export interface ChartTheme {
  up: string;
  down: string;
  grid: string;
  border: string;
  text: string;
  textStrong: string;
  crosshair: string;
  labelBg: string;
  labelText: string;
  inverseText: string;
  line: string;
  guide: string;
  entry: string;
  takeProfit: string;
  stopLoss: string;
  liquidation: string;
  custom: string;
  /** Colours for indicator lines, used in order. */
  palette: string[];
  font: string;
}

type ColorKey = Exclude<keyof ChartTheme, "palette" | "font">;

/** CSS custom property per theme colour (defined in TradingChart.svelte). */
export const THEME_PROPERTIES: Record<ColorKey, string> = {
  up: "--cy-trading-chart-up",
  down: "--cy-trading-chart-down",
  grid: "--cy-trading-chart-grid",
  border: "--cy-trading-chart-border",
  text: "--cy-trading-chart-text",
  textStrong: "--cy-trading-chart-text-strong",
  crosshair: "--cy-trading-chart-crosshair",
  labelBg: "--cy-trading-chart-label-bg",
  labelText: "--cy-trading-chart-label-text",
  inverseText: "--cy-trading-chart-inverse-text",
  line: "--cy-trading-chart-line",
  guide: "--cy-trading-chart-guide",
  entry: "--cy-trading-chart-entry",
  takeProfit: "--cy-trading-chart-take-profit",
  stopLoss: "--cy-trading-chart-stop-loss",
  liquidation: "--cy-trading-chart-liquidation",
  custom: "--cy-trading-chart-custom",
};

export const PALETTE_SIZE = 6;
export const paletteProperty = (i: number) => `--cy-trading-chart-series-${i + 1}`;
export const FONT_PROPERTY = "--cy-trading-chart-font";

/** Reads the resolved theme from `element`; missing values fall back to its text colour / font. */
export function readTheme(element: Element): ChartTheme {
  const style = getComputedStyle(element);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  const color = style.color || "";
  const theme = { font: read(FONT_PROPERTY, style.fontFamily || "monospace") } as ChartTheme;
  for (const [key, property] of Object.entries(THEME_PROPERTIES)) {
    theme[key as ColorKey] = read(property, color);
  }
  theme.palette = Array.from({ length: PALETTE_SIZE }, (_, i) => read(paletteProperty(i), theme.line));
  return theme;
}

/**
 * Resolves a consumer-supplied colour that may use var() (e.g. a marker's
 * `color: "var(--color-accent-violet)"`) to a value a canvas accepts.
 * Plain colours pass through untouched.
 */
export function resolveColor(element: Element, color: string | undefined, fallback: string): string {
  if (!color) return fallback;
  if (!color.includes("var(")) return color;
  const probe = element.ownerDocument.createElement("span");
  probe.style.color = color;
  element.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved || fallback;
}

/**
 * Calls `onChange` when `data-theme`, `class` or `style` changes on <html>
 * or the preferred colour scheme flips. Returns a disposer.
 */
export function watchTheme(onChange: () => void, doc: Document = document): () => void {
  const observer =
    typeof MutationObserver === "undefined"
      ? null
      : new MutationObserver(() => onChange());
  observer?.observe(doc.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class", "style"],
  });
  const view = doc.defaultView;
  const scheme = typeof view?.matchMedia === "function" ? view.matchMedia("(prefers-color-scheme: dark)") : null;
  scheme?.addEventListener?.("change", onChange);
  return () => {
    observer?.disconnect();
    scheme?.removeEventListener?.("change", onChange);
  };
}

/** Tracks `prefers-reduced-motion: reduce`. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
