/**
 * Builds one frame's geometry: pane layout, visible bars, each pane's price
 * scale fitted to the visible values, and the time-axis ticks. Only the
 * visible bars are scanned, so the cost does not grow with the series.
 */
import type { Candle } from "../../types.js";
import type { AxisTick } from "../renderers/axes.js";
import type { BarGeometry } from "../renderers/types.js";
import { MAIN_PANE, type IndicatorInstance } from "./indicatorStore.js";
import { computeLayout, type ChartLayout, type PaneRect } from "./layout.js";
import { autoDigits, fixedFormatter, priceDigits, volumeFormatter, type NumberFormatter } from "./numberFormat.js";
import { emptyExtent, includeValue, PriceScale, type Extent } from "./priceScale.js";
import { VOLUME_PANE, type Scene } from "./scene.js";
import { pickUnit, spaceTicks, timeTicks, ZoneClock } from "./timeLabels.js";
import type { TimeScale } from "./timeScale.js";

export const TIME_AXIS_HEIGHT = 24;
/** Minimum distance between time labels. */
const TIME_LABEL_SPACING = 90;
/** Share of the main pane used by the volume overlay. */
const VOLUME_OVERLAY_SHARE = 0.2;

export interface PaneFrame {
  id: string;
  rect: PaneRect;
  scale: PriceScale;
  format: NumberFormatter;
  indicators: IndicatorInstance[];
}

export interface Frame {
  layout: ChartLayout;
  bars: BarGeometry;
  panes: PaneFrame[];
  /** Scale of the volume histogram (overlay or pane), or null when hidden. */
  volumeScale: PriceScale | null;
  timeTicks: AxisTick[];
}

export interface FrameInput {
  scene: Scene;
  timeScale: TimeScale;
  width: number;
  height: number;
  priceAxisWidth: number;
  ratios: Readonly<Record<string, number>>;
  clock: ZoneClock;
}

/** Main pane, then the volume pane (if any), then indicator sub-panes in order. */
export function paneIdsOf(scene: Scene): string[] {
  const ids = [MAIN_PANE];
  if (scene.options.volume === "pane" && scene.candles.length > 0) ids.push(VOLUME_PANE);
  for (const id of scene.store.subPanes()) if (!ids.includes(id)) ids.push(id);
  return ids;
}

export function buildFrame(input: FrameInput): Frame {
  const { scene, timeScale } = input;
  const layout = computeLayout({
    width: input.width,
    height: input.height,
    paneIds: paneIdsOf(scene),
    ratios: input.ratios,
    priceAxisWidth: input.priceAxisWidth,
    timeAxisHeight: TIME_AXIS_HEIGHT,
  });
  timeScale.setWidth(layout.plotWidth);
  const { first, last } = timeScale.visibleBars();
  const bars: BarGeometry = {
    first,
    last,
    x: (i) => timeScale.indexToX(i),
    spacing: timeScale.barSpacing,
    dpr: scene.dpr,
  };
  const panes = layout.panes.map((rect) => buildPane(scene, rect, bars));
  return {
    layout,
    bars,
    panes,
    volumeScale: volumeScaleOf(scene, panes, bars),
    timeTicks: buildTimeTicks(input, bars),
  };
}

function buildPane(scene: Scene, rect: PaneRect, bars: BarGeometry): PaneFrame {
  const indicators = rect.id === VOLUME_PANE ? [] : scene.store.inPane(rect.id);
  const main = rect.id === MAIN_PANE;
  const scale = new PriceScale(main ? scene.options.scaleMode : "linear", 0.1, main ? 0.1 : 0.05);
  scale.setBounds(rect.top, rect.height);
  if (rect.id === VOLUME_PANE) {
    scale.marginBottom = 0;
    scale.fit(volumeExtent(scene.candles, bars));
    return { id: rect.id, rect, scale, format: volumeFormatter(scene.options.locale), indicators };
  }
  const extent = main ? candleExtent(scene, bars) : emptyExtent();
  const fixed = indicators.find((instance) => instance.binding.range)?.binding.range;
  if (fixed) {
    includeValue(extent, fixed[0]);
    includeValue(extent, fixed[1]);
  } else {
    for (const instance of indicators) includeIndicator(extent, instance, bars);
  }
  scale.fit(extent);
  return { id: rect.id, rect, scale, format: paneFormat(scene, main, extent), indicators };
}

function paneFormat(scene: Scene, main: boolean, extent: Extent): NumberFormatter {
  const magnitude = Math.max(Math.abs(extent.min), Math.abs(extent.max));
  const digits = main ? priceDigits(scene.options.market, magnitude) : autoDigits(magnitude);
  return fixedFormatter(digits, scene.options.locale);
}

/** High / low of the visible bars (close only for line and area series). */
export function candleExtent(scene: Scene, bars: BarGeometry): Extent {
  const extent = emptyExtent();
  const closeOnly = scene.options.seriesType === "line" || scene.options.seriesType === "area";
  for (let i = bars.first; i <= bars.last; i++) {
    const c = scene.candles[i];
    includeValue(extent, closeOnly ? c.close : c.high);
    includeValue(extent, closeOnly ? c.close : c.low);
  }
  return extent;
}

function includeIndicator(extent: Extent, instance: IndicatorInstance, bars: BarGeometry): void {
  if (instance.binding.includeZero) includeValue(extent, 0);
  for (const series of instance.series) {
    for (let i = bars.first; i <= bars.last; i++) includeValue(extent, series.values[i]);
  }
}

export function volumeExtent(candles: readonly Candle[], bars: BarGeometry): Extent {
  const extent: Extent = { min: 0, max: -Infinity };
  for (let i = bars.first; i <= bars.last; i++) includeValue(extent, candles[i].volume ?? NaN);
  return extent;
}

function volumeScaleOf(scene: Scene, panes: PaneFrame[], bars: BarGeometry): PriceScale | null {
  if (scene.options.volume === "pane") return panes.find((p) => p.id === VOLUME_PANE)?.scale ?? null;
  if (scene.options.volume !== "overlay") return null;
  const main = panes[0];
  const scale = new PriceScale("linear", 1 - VOLUME_OVERLAY_SHARE, 0);
  scale.setBounds(main.rect.top, main.rect.height);
  scale.fit(volumeExtent(scene.candles, bars));
  return scale;
}

function buildTimeTicks(input: FrameInput, bars: BarGeometry): AxisTick[] {
  const { scene, timeScale } = input;
  if (bars.last < bars.first) return [];
  const unit = pickUnit(scene.interval, timeScale.barSpacing, TIME_LABEL_SPACING);
  const times = (i: number) => scene.candles[i].time;
  const ticks = timeTicks(times, bars.first, bars.last, unit, input.clock).map((tick) => ({
    x: bars.x(tick.index),
    index: tick.index,
    level: tick.level,
  }));
  return spaceTicks(ticks, TIME_LABEL_SPACING * 0.6).map((tick) => ({
    at: tick.x,
    text: scene.time.tickLabel(times(tick.index), tick.level),
  }));
}
