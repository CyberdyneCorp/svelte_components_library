/**
 * Bar geometry for `BarChart`, independent of orientation and layout.
 *
 * Bars are placed along a *band* axis (one band per category) and sized
 * along a *value* axis. Single, grouped and stacked data all reduce to
 * "this series' value span inside this category's band", which is then
 * mapped to an SVG rectangle for either orientation.
 */

export type BarDatum = { label: string; value: number; color?: string };

export type BarSeries = {
  name: string;
  color?: string;
  data: { label: string; value: number }[];
};

export type BarPlot = { left: number; top: number; width: number; height: number };

export type BarRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  seriesIndex: number;
  categoryIndex: number;
  value: number;
};

export type BarText = { x: number; y: number; text: string; anchor: "start" | "middle" | "end" };

export type BarLine = { x1: number; y1: number; x2: number; y2: number };

export type BarTick = { line: BarLine; label: BarText };

export type BarMatrix = {
  categories: string[];
  /** `values[series][category]`; a category a series lacks is 0. */
  values: number[][];
};

export type BarLayoutInput = BarMatrix & {
  /** One colour per series, or one per category when `perCategoryColors`. */
  colors: string[];
  perCategoryColors?: boolean;
  stacked?: boolean;
  horizontal?: boolean;
  plot: BarPlot;
};

export type BarLayout = {
  max: number;
  rects: BarRect[];
  categoryLabels: BarText[];
  valueLabels: BarText[];
  ticks: BarTick[];
  axes: BarLine[];
};

const BAR_GAP = 0.2;
const TICK_COUNT = 4;

/** Categories in order of first appearance; missing values become 0. */
export function seriesMatrix(series: BarSeries[]): BarMatrix {
  const categories = [...new Set(series.flatMap((s) => s.data.map((d) => d.label)))];
  const values = series.map((s) => {
    const byLabel = new Map(s.data.map((d) => [d.label, d.value]));
    return categories.map((c) => byLabel.get(c) ?? 0);
  });
  return { categories, values };
}

/** One series holding the flat `data` values. */
export function dataMatrix(data: BarDatum[]): BarMatrix {
  return { categories: data.map((d) => d.label), values: [data.map((d) => d.value)] };
}

export function formatBarValue(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

function stackTotals(values: number[][], categoryCount: number): number[] {
  return Array.from({ length: categoryCount }, (_, c) =>
    values.reduce((sum, row) => sum + Math.max(0, row[c]), 0),
  );
}

function scaleMax(input: BarMatrix, stacked: boolean): number {
  const candidates = stacked
    ? stackTotals(input.values, input.categories.length)
    : input.values.flat();
  const max = candidates.length ? Math.max(...candidates) : 1;
  return max > 0 ? max : 1;
}

type Span = { band: number; slot: number; slots: number; from: number; to: number };

/** Value spans per (series, category), in series-major order. */
function spans(input: BarMatrix, stacked: boolean): Span[][] {
  const offsets = input.categories.map(() => 0);
  const slots = stacked ? 1 : input.values.length;
  return input.values.map((row, s) =>
    row.map((value, c) => {
      if (!stacked) return { band: c, slot: s, slots, from: 0, to: value };
      const from = offsets[c];
      offsets[c] = from + Math.max(0, value);
      return { band: c, slot: 0, slots, from, to: offsets[c] };
    }),
  );
}

type Axes = {
  bandOrigin: number;
  bandLength: number;
  valueLength: number;
  categoryCount: number;
  max: number;
};

/** Position along the band axis and thickness of one bar. */
function bandSlot(span: Span, axes: Axes): { pos: number; size: number } {
  const band = axes.bandLength / axes.categoryCount;
  const inner = band * (1 - BAR_GAP);
  const size = inner / span.slots;
  return { pos: axes.bandOrigin + band * span.band + (band * BAR_GAP) / 2 + size * span.slot, size };
}

function toRect(span: Span, axes: Axes, plot: BarPlot, horizontal: boolean) {
  const { pos, size } = bandSlot(span, axes);
  const start = (span.from / axes.max) * axes.valueLength;
  const length = ((span.to - span.from) / axes.max) * axes.valueLength;
  if (horizontal) return { x: plot.left + start, y: pos, width: length, height: size };
  return { x: pos, y: plot.top + plot.height - start - length, width: size, height: length };
}

function axesFor(input: BarMatrix, plot: BarPlot, horizontal: boolean, max: number): Axes {
  return {
    bandOrigin: horizontal ? plot.top : plot.left,
    bandLength: horizontal ? plot.height : plot.width,
    valueLength: horizontal ? plot.width : plot.height,
    categoryCount: Math.max(1, input.categories.length),
    max,
  };
}

function categoryLabel(text: string, index: number, axes: Axes, plot: BarPlot, horizontal: boolean): BarText {
  const band = axes.bandLength / axes.categoryCount;
  const center = axes.bandOrigin + band * index + band / 2;
  return horizontal
    ? { x: plot.left - 6, y: center + 4, text, anchor: "end" }
    : { x: center, y: plot.top + plot.height + 16, text, anchor: "middle" };
}

/** Label just past the end of a bar (or of a whole stack). */
function endLabel(rect: Omit<BarRect, "color" | "seriesIndex" | "categoryIndex" | "value">, value: number, horizontal: boolean): BarText {
  const text = formatBarValue(value);
  return horizontal
    ? { x: rect.x + rect.width + 6, y: rect.y + rect.height / 2 + 4, text, anchor: "start" }
    : { x: rect.x + rect.width / 2, y: rect.y - 6, text, anchor: "middle" };
}

function ticksFor(max: number, plot: BarPlot, horizontal: boolean): BarTick[] {
  const step = max / TICK_COUNT;
  return Array.from({ length: TICK_COUNT + 1 }, (_, i) => {
    const value = step * i;
    const text = formatBarValue(value);
    if (horizontal) {
      const x = plot.left + (value / max) * plot.width;
      return {
        line: { x1: x, y1: plot.top, x2: x, y2: plot.top + plot.height },
        label: { x, y: plot.top + plot.height + 16, text, anchor: "middle" },
      };
    }
    const y = plot.top + plot.height - (value / max) * plot.height;
    return {
      line: { x1: plot.left, y1: y, x2: plot.left + plot.width, y2: y },
      label: { x: plot.left - 8, y: y + 4, text, anchor: "end" },
    };
  });
}

function axesLines(plot: BarPlot, horizontal: boolean): BarLine[] {
  const bottom = plot.top + plot.height;
  const valueAxis = { x1: plot.left, y1: plot.top, x2: plot.left, y2: bottom };
  if (horizontal) return [valueAxis];
  return [{ x1: plot.left, y1: bottom, x2: plot.left + plot.width, y2: bottom }, valueAxis];
}

function stackTotalLabels(input: BarMatrix, rects: BarRect[], horizontal: boolean): BarText[] {
  const totals = stackTotals(input.values, input.categories.length);
  return input.categories.map((_, c) => {
    const column = rects.filter((r) => r.categoryIndex === c);
    const top = column[column.length - 1];
    const extent = horizontal
      ? { ...top, x: column[0].x, width: column.reduce((w, r) => w + r.width, 0) }
      : { ...top, height: column.reduce((h, r) => h + r.height, 0) };
    return endLabel(extent, totals[c], horizontal);
  });
}

/** Full geometry for a bar chart: rectangles, labels, ticks and axes. */
export function layoutBars(input: BarLayoutInput): BarLayout {
  const stacked = input.stacked ?? false;
  const horizontal = input.horizontal ?? false;
  const max = scaleMax(input, stacked);
  const axes = axesFor(input, input.plot, horizontal, max);
  const rects = spans(input, stacked).flatMap((row, s) =>
    row.map((span, c) => ({
      ...toRect(span, axes, input.plot, horizontal),
      color: input.colors[input.perCategoryColors ? c : s],
      seriesIndex: s,
      categoryIndex: c,
      value: input.values[s][c],
    })),
  );
  const valueLabels = stacked
    ? stackTotalLabels(input, rects, horizontal)
    : rects.map((r) => endLabel(r, r.value, horizontal));
  return {
    max,
    rects,
    categoryLabels: input.categories.map((text, i) => categoryLabel(text, i, axes, input.plot, horizontal)),
    valueLabels,
    ticks: ticksFor(max, input.plot, horizontal),
    axes: axesLines(input.plot, horizontal),
  };
}

/** Bars thinner than this in either direction get no in-bar marker. */
export const MIN_MARKER_EXTENT = 10;

/** Centre and size of a series marker inside `rect`, or null if it does not fit. */
export function rectMarker(rect: BarRect): { cx: number; cy: number; size: number } | null {
  const extent = Math.min(rect.width, rect.height);
  if (extent < MIN_MARKER_EXTENT) return null;
  return { cx: rect.x + rect.width / 2, cy: rect.y + rect.height / 2, size: Math.min(10, extent * 0.6) };
}
