/**
 * Paints the overlay canvas layer: crosshair, its axis labels and the
 * legends. Moving the pointer only repaints this layer.
 */
import { isUp } from "../renderers/candles.js";
import { drawPriceLabel, drawTimeLabel } from "../renderers/axes.js";
import { drawCrosshair, drawLegend, type LegendRow } from "../renderers/crosshair.js";
import type { Box } from "../renderers/types.js";
import type { Frame, PaneFrame } from "./frame.js";
import { MAIN_PANE, type IndicatorInstance } from "./indicatorStore.js";
import { paneAt } from "./layout.js";
import { percentFormatter, volumeFormatter } from "./numberFormat.js";
import { axisBoxOf, seriesColor } from "./paintMain.js";
import { VOLUME_PANE, type Scene } from "./scene.js";

const LEGEND_INSET = 8;

export function paintOverlay(ctx: CanvasRenderingContext2D, frame: Frame, scene: Scene): void {
  if (scene.candles.length === 0) return;
  const crosshair = scene.crosshair;
  if (crosshair) paintCrosshair(ctx, frame, scene, crosshair.index, crosshair.y);
  const index = crosshair?.index ?? scene.candles.length - 1;
  for (const pane of frame.panes) {
    drawLegend(ctx, legendRows(scene, pane, index), LEGEND_INSET, pane.rect.top + LEGEND_INSET / 2, scene.theme.font);
  }
}

function paintCrosshair(ctx: CanvasRenderingContext2D, frame: Frame, scene: Scene, index: number, y: number | null) {
  const { layout } = frame;
  const plot: Box = { left: 0, top: 0, width: layout.plotWidth, height: layout.timeAxis.top };
  const x = frame.bars.x(index);
  drawCrosshair(ctx, plot, x, y, scene.theme.crosshair, scene.dpr);
  const label = { background: scene.theme.labelBg, color: scene.theme.labelText, font: scene.theme.font };
  const time = scene.time.crosshairLabel(scene.candles[index].time, scene.interval);
  drawTimeLabel(ctx, layout.timeAxis, x, { ...label, text: time });
  const pane = y === null ? undefined : paneAt(layout, y);
  const framePane = pane && frame.panes.find((p) => p.id === pane.id);
  if (framePane && y !== null) {
    const text = framePane.format(framePane.scale.yToPrice(y));
    drawPriceLabel(ctx, axisBoxOf(frame, framePane), y, { ...label, text });
  }
}

/** Legend rows of a pane at bar `index`. */
export function legendRows(scene: Scene, pane: PaneFrame, index: number): LegendRow[] {
  if (pane.id === VOLUME_PANE) return [volumeRow(scene, index)];
  const rows = pane.indicators.map((instance) => indicatorRow(scene, pane, instance, index));
  return pane.id === MAIN_PANE ? [priceRow(scene, pane, index), ...rows] : rows;
}

function priceRow(scene: Scene, pane: PaneFrame, index: number): LegendRow {
  const { candles, theme, options } = scene;
  const candle = candles[index];
  const tone = isUp(candle) ? theme.up : theme.down;
  const names = options.labels.legend;
  const prevClose = candles[index - 1]?.close ?? candle.open;
  const change = prevClose ? (candle.close - prevClose) / prevClose : NaN;
  const row: LegendSegment[] = [];
  if (options.market) row.push({ text: options.market.symbol, color: theme.textStrong });
  row.push(
    { text: names.open, color: theme.text },
    { text: pane.format(candle.open), color: tone },
    { text: names.high, color: theme.text },
    { text: pane.format(candle.high), color: tone },
    { text: names.low, color: theme.text },
    { text: pane.format(candle.low), color: tone },
    { text: names.close, color: theme.text },
    { text: pane.format(candle.close), color: tone },
  );
  if (candle.volume !== undefined) {
    row.push({ text: names.volume, color: theme.text }, { text: volumeFormatter(options.locale)(candle.volume), color: tone });
  }
  row.push({ text: percentFormatter(options.locale)(change), color: tone });
  return row;
}

type LegendSegment = LegendRow[number];

function volumeRow(scene: Scene, index: number): LegendRow {
  const volume = scene.candles[index].volume ?? NaN;
  return [
    { text: scene.options.labels.volume, color: scene.theme.text },
    { text: volumeFormatter(scene.options.locale)(volume), color: scene.theme.textStrong },
  ];
}

function indicatorRow(scene: Scene, pane: PaneFrame, instance: IndicatorInstance, index: number): LegendRow {
  const row: LegendSegment[] = [{ text: instance.title, color: scene.theme.text }];
  for (const series of instance.series) {
    const color = series.spec.style === "histogram" ? scene.theme.text : seriesColor(scene, series);
    row.push({ text: pane.format(series.values[index]) || "—", color });
  }
  return row;
}
