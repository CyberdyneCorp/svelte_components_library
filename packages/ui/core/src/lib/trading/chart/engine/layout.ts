/**
 * Pane layout (design D3): the main price pane plus sub-panes stacked below
 * it, sized by height ratios, with a price-axis gutter on the right and a
 * time-axis gutter at the bottom.
 */

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PaneRect extends Rect {
  id: string;
}

export interface ChartLayout {
  width: number;
  height: number;
  /** Width of the plotting area (left of the price axis). */
  plotWidth: number;
  priceAxis: Rect;
  timeAxis: Rect;
  panes: PaneRect[];
  /** y of each separator between pane i and pane i + 1. */
  separators: number[];
}

export interface LayoutInput {
  width: number;
  height: number;
  paneIds: readonly string[];
  /** Relative height per pane id; missing ids get the default ratio. */
  ratios: Readonly<Record<string, number>>;
  priceAxisWidth: number;
  timeAxisHeight: number;
}

/** Default relative heights: the main pane is three times a sub-pane. */
export const MAIN_PANE_RATIO = 3;
export const SUB_PANE_RATIO = 1;
/** Minimum height of a pane while dragging a separator. */
export const MIN_PANE_HEIGHT = 32;
/** Half-height of the separator hit zone. */
export const SEPARATOR_HIT = 4;

export function ratioOf(ratios: Readonly<Record<string, number>>, id: string, index: number): number {
  const value = ratios[id];
  if (typeof value === "number" && value > 0 && Number.isFinite(value)) return value;
  return index === 0 ? MAIN_PANE_RATIO : SUB_PANE_RATIO;
}

export function computeLayout(input: LayoutInput): ChartLayout {
  const width = Math.max(0, input.width);
  const height = Math.max(0, input.height);
  const plotWidth = Math.max(0, width - input.priceAxisWidth);
  const plotHeight = Math.max(0, height - input.timeAxisHeight);
  const weights = input.paneIds.map((id, i) => ratioOf(input.ratios, id, i));
  const total = weights.reduce((sum, w) => sum + w, 0) || 1;

  const panes: PaneRect[] = [];
  const separators: number[] = [];
  let top = 0;
  input.paneIds.forEach((id, i) => {
    const last = i === input.paneIds.length - 1;
    const paneHeight = last ? plotHeight - top : Math.round((plotHeight * weights[i]) / total);
    panes.push({ id, left: 0, top, width: plotWidth, height: paneHeight });
    top += paneHeight;
    if (!last) separators.push(top);
  });

  return {
    width,
    height,
    plotWidth,
    priceAxis: { left: plotWidth, top: 0, width: width - plotWidth, height: plotHeight },
    timeAxis: { left: 0, top: plotHeight, width: plotWidth, height: height - plotHeight },
    panes,
    separators,
  };
}

/** Index of the separator within the hit zone of `y` (inside the plot), or -1. */
export function hitSeparator(layout: ChartLayout, x: number, y: number): number {
  if (x < 0 || x > layout.plotWidth) return -1;
  return layout.separators.findIndex((sy) => Math.abs(sy - y) <= SEPARATOR_HIT);
}

/** Pane under `y`, or undefined over the time axis. */
export function paneAt(layout: ChartLayout, y: number): PaneRect | undefined {
  return layout.panes.find((pane) => y >= pane.top && y < pane.top + pane.height);
}

/**
 * Moves separator `index` by `dy` pixels, resizing the panes on both sides
 * (each kept at least MIN_PANE_HEIGHT tall), and returns the new ratios as
 * pixel heights keyed by pane id. Other panes keep their height.
 */
export function dragSeparator(layout: ChartLayout, index: number, dy: number): Record<string, number> {
  const heights = layout.panes.map((pane) => pane.height);
  const above = heights[index];
  const below = heights[index + 1];
  if (above === undefined || below === undefined) return heightsById(layout, heights);
  const pair = above + below;
  const floor = Math.min(MIN_PANE_HEIGHT, pair / 2);
  const next = Math.min(pair - floor, Math.max(floor, above + dy));
  heights[index] = next;
  heights[index + 1] = pair - next;
  return heightsById(layout, heights);
}

function heightsById(layout: ChartLayout, heights: number[]): Record<string, number> {
  return Object.fromEntries(layout.panes.map((pane, i) => [pane.id, heights[i]]));
}
