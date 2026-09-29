/**
 * Paints the main canvas layer: grid, series, volume, indicators, markers,
 * price lines, axes and the last-price label. The crosshair and legend live
 * on the overlay layer (paintOverlay.ts).
 */
import { isUp } from "../renderers/candles.js";
import { drawCandles, drawOhlcBars } from "../renderers/candles.js";
import { drawMarkers, drawPriceLines, type PlacedMarker, type PlacedPriceLine } from "../renderers/annotations.js";
import { drawGrid, drawGuides, drawLastPrice, drawPriceAxis, drawPriceLabel, drawTimeAxis } from "../renderers/axes.js";
import { drawArea, drawBand, drawHistogram, drawLine } from "../renderers/series.js";
import type { BarGeometry, Box } from "../renderers/types.js";
import type { Frame, PaneFrame } from "./frame.js";
import { MAIN_PANE, type IndicatorInstance, type IndicatorSeries } from "./indicatorStore.js";
import type { PriceScale } from "./priceScale.js";
import { priceLineId, VOLUME_PANE, type Scene } from "./scene.js";

const VOLUME_OVERLAY_ALPHA = 0.35;
const VOLUME_PANE_ALPHA = 0.7;

export function paintMain(ctx: CanvasRenderingContext2D, frame: Frame, scene: Scene): void {
  for (const pane of frame.panes) paintPane(ctx, frame, scene, pane);
  const { layout } = frame;
  const full: Box = { left: 0, top: 0, width: layout.width, height: layout.height };
  drawGrid(ctx, full, layout.separators, [], scene.theme.border, scene.dpr);
  const text = { color: scene.theme.text, font: scene.theme.font };
  drawTimeAxis(ctx, layout.timeAxis, frame.timeTicks, text, scene.theme.border, scene.dpr);
}

/** Axis gutter next to a pane. */
export const axisBoxOf = (frame: Frame, pane: PaneFrame): Box => ({
  left: frame.layout.plotWidth,
  top: pane.rect.top,
  width: frame.layout.priceAxis.width,
  height: pane.rect.height,
});

function paintPane(ctx: CanvasRenderingContext2D, frame: Frame, scene: Scene, pane: PaneFrame): void {
  const ticks = pane.scale.ticks().map((value) => ({ at: pane.scale.priceToY(value), text: pane.format(value) }));
  const inside = ticks.filter((t) => t.at >= pane.rect.top + 6 && t.at <= pane.rect.top + pane.rect.height - 6);
  drawGrid(ctx, pane.rect, inside.map((t) => t.at), frame.timeTicks.map((t) => t.at), scene.theme.grid, scene.dpr);
  const labels = pane.id === MAIN_PANE ? inside.filter((t) => !underLastPrice(scene, pane, t.at)) : inside;

  ctx.save();
  ctx.beginPath();
  ctx.rect(pane.rect.left, pane.rect.top, pane.rect.width, pane.rect.height);
  ctx.clip();
  paintContent(ctx, frame, scene, pane);
  ctx.restore();

  const axis = axisBoxOf(frame, pane);
  drawPriceAxis(ctx, axis, labels, { color: scene.theme.text, font: scene.theme.font }, scene.theme.border, scene.dpr);
  if (pane.id === MAIN_PANE) paintPriceMarks(ctx, frame, scene, pane, axis);
}

/** Half the height of an axis label box: ticks closer than this to the last price are hidden. */
const LABEL_CLEARANCE = 10;

function underLastPrice(scene: Scene, pane: PaneFrame, y: number): boolean {
  const last = scene.candles[scene.candles.length - 1];
  return !!last && Math.abs(pane.scale.priceToY(last.close) - y) < LABEL_CLEARANCE;
}

function paintContent(ctx: CanvasRenderingContext2D, frame: Frame, scene: Scene, pane: PaneFrame): void {
  if (pane.id === VOLUME_PANE) {
    if (frame.volumeScale) paintVolume(ctx, frame.bars, scene, frame.volumeScale, VOLUME_PANE_ALPHA);
    return;
  }
  if (pane.id !== MAIN_PANE) {
    paintIndicators(ctx, frame.bars, scene, pane);
    return;
  }
  if (frame.volumeScale && scene.options.volume === "overlay") {
    paintVolume(ctx, frame.bars, scene, frame.volumeScale, VOLUME_OVERLAY_ALPHA);
  }
  paintBands(ctx, frame.bars, scene, pane);
  paintSeries(ctx, frame.bars, scene, pane.scale);
  paintIndicators(ctx, frame.bars, scene, pane);
  drawMarkers(ctx, placeMarkers(frame.bars, scene, pane.scale), scene.theme.font);
}

function paintSeries(ctx: CanvasRenderingContext2D, bars: BarGeometry, scene: Scene, scale: PriceScale): void {
  const y = (value: number) => scale.priceToY(value);
  const colors = { up: scene.theme.up, down: scene.theme.down };
  const close = (i: number) => scene.candles[i].close;
  switch (scene.options.seriesType) {
    case "line":
      drawLine(ctx, bars, close, y, scene.theme.line, 2);
      break;
    case "area":
      drawArea(ctx, bars, close, y, scale.top + scale.height, scene.theme.line);
      break;
    case "bars":
      drawOhlcBars(ctx, scene.candles, bars, y, colors);
      break;
    default:
      drawCandles(ctx, scene.candles, bars, y, colors, scene.options.seriesType === "hollow");
  }
}

function paintVolume(ctx: CanvasRenderingContext2D, bars: BarGeometry, scene: Scene, scale: PriceScale, alpha: number) {
  const { candles, theme } = scene;
  drawHistogram(
    ctx,
    bars,
    (i) => candles[i].volume ?? NaN,
    (value) => scale.priceToY(value),
    0,
    [theme.up, theme.down],
    (i) => (isUp(candles[i]) ? 0 : 1),
    alpha,
  );
}

/** Theme or consumer colour of an indicator output. */
export function seriesColor(scene: Scene, series: IndicatorSeries): string {
  const palette = scene.theme.palette;
  const fallback = palette[series.slot % palette.length] ?? scene.theme.line;
  return series.color ? scene.color(series.color, fallback) : fallback;
}

function paintBands(ctx: CanvasRenderingContext2D, bars: BarGeometry, scene: Scene, pane: PaneFrame): void {
  const y = (value: number) => pane.scale.priceToY(value);
  for (const instance of pane.indicators) {
    const band = instance.binding.band;
    if (!band) continue;
    const upper = instance.series.find((s) => s.spec.key === band[0]);
    const lower = instance.series.find((s) => s.spec.key === band[1]);
    if (!upper || !lower) continue;
    const color = seriesColor(scene, instance.series[0]);
    drawBand(ctx, bars, (i) => upper.values[i], (i) => lower.values[i], y, color);
  }
}

function paintIndicators(ctx: CanvasRenderingContext2D, bars: BarGeometry, scene: Scene, pane: PaneFrame): void {
  const y = (value: number) => pane.scale.priceToY(value);
  for (const instance of pane.indicators) {
    paintGuides(ctx, scene, pane, instance);
    // Histograms first, so lines stay on top.
    const ordered = [...instance.series].sort((a, b) => Number(b.spec.style === "histogram") - Number(a.spec.style === "histogram"));
    for (const series of ordered) {
      const valueAt = (i: number) => series.values[i];
      if (series.spec.style === "histogram") {
        const colors = [scene.theme.up, scene.theme.down] as const;
        drawHistogram(ctx, bars, valueAt, y, 0, colors, (i) => (series.values[i] >= 0 ? 0 : 1), 0.6);
      } else {
        drawLine(ctx, bars, valueAt, y, seriesColor(scene, series));
      }
    }
  }
}

function paintGuides(ctx: CanvasRenderingContext2D, scene: Scene, pane: PaneFrame, instance: IndicatorInstance) {
  const levels = instance.binding.guides?.(instance.config) ?? [];
  if (levels.length === 0) return;
  const ys = levels.map((level) => pane.scale.priceToY(level));
  drawGuides(ctx, pane.rect, ys, scene.theme.guide, scene.dpr);
}

/** Markers on visible bars; several markers on one side of a bar stack outwards. */
const STACK_STEP = 12;
const ANCHOR = { above: "high", below: "low", at: "close" } as const;
const STACK_DIRECTION = { above: -1, below: 1, at: 0 } as const;

export function placeMarkers(bars: BarGeometry, scene: Scene, scale: PriceScale): PlacedMarker[] {
  const stacks = new Map<string, number>();
  const placed: PlacedMarker[] = [];
  for (const { index, marker } of scene.markers) {
    if (index < bars.first || index > bars.last) continue;
    const anchor = scene.candles[index][ANCHOR[marker.position]];
    const key = `${index}:${marker.position}`;
    const depth = stacks.get(key) ?? 0;
    stacks.set(key, depth + 1);
    placed.push({
      x: bars.x(index),
      y: scale.priceToY(anchor) + STACK_DIRECTION[marker.position] * depth * STACK_STEP,
      shape: marker.shape,
      position: marker.position,
      color: scene.color(marker.color, defaultMarkerColor(scene, marker.shape)),
      text: marker.text,
    });
  }
  return placed;
}

function defaultMarkerColor(scene: Scene, shape: string): string {
  if (shape === "arrow-up") return scene.theme.up;
  if (shape === "arrow-down") return scene.theme.down;
  return scene.theme.line;
}

const KIND_COLOR = {
  entry: "entry",
  "take-profit": "takeProfit",
  "stop-loss": "stopLoss",
  liquidation: "liquidation",
  custom: "custom",
} as const;

/** Price lines resolved to pixels; a dragged line is drawn at its draft price. */
export function placePriceLines(scene: Scene, pane: PaneFrame): PlacedPriceLine[] {
  return scene.priceLines.map((line, i) => {
    const id = priceLineId(line, i);
    const dragging = scene.draft?.id === id;
    const price = dragging && scene.draft ? scene.draft.price : line.price;
    const kind = line.kind ?? "custom";
    const tag = kind === "custom" ? "" : scene.options.labels.priceLines[kind];
    return {
      y: pane.scale.priceToY(price),
      color: scene.color(line.color, scene.theme[KIND_COLOR[kind]]),
      style: line.style ?? (kind === "entry" ? "solid" : "dashed"),
      label: line.label ?? tag,
      priceText: pane.format(price),
      active: dragging || scene.hoverLine === id,
    };
  });
}

function paintPriceMarks(ctx: CanvasRenderingContext2D, frame: Frame, scene: Scene, pane: PaneFrame, axis: Box): void {
  const last = scene.candles[scene.candles.length - 1];
  if (last) {
    const y = pane.scale.priceToY(last.close);
    const label = {
      text: pane.format(last.close),
      background: isUp(last) ? scene.theme.up : scene.theme.down,
      color: scene.theme.inverseText,
      font: scene.theme.font,
    };
    if (y >= pane.rect.top && y <= pane.rect.top + pane.rect.height) drawLastPrice(ctx, pane.rect, axis, y, label, scene.dpr);
    else drawPriceLabel(ctx, axis, y, label);
  }
  drawPriceLines(ctx, placePriceLines(scene, pane), pane.rect, axis, scene.theme.inverseText, scene.theme.font, scene.dpr);
}
