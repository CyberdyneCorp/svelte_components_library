/** Line, area, histogram and band-fill renderers. */
import type { BarGeometry, ValueAt, YMap } from "./types.js";

/** Adds a polyline through the finite values to the current path; NaN starts a new segment. */
function tracePolyline(ctx: CanvasRenderingContext2D, bars: BarGeometry, valueAt: ValueAt, y: YMap): void {
  let drawing = false;
  for (let i = bars.first; i <= bars.last; i++) {
    const value = valueAt(i);
    if (!Number.isFinite(value)) {
      drawing = false;
      continue;
    }
    if (drawing) ctx.lineTo(bars.x(i), y(value));
    else ctx.moveTo(bars.x(i), y(value));
    drawing = true;
  }
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  bars: BarGeometry,
  valueAt: ValueAt,
  y: YMap,
  color: string,
  width = 1.5,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.setLineDash([]);
  ctx.beginPath();
  tracePolyline(ctx, bars, valueAt, y);
  ctx.stroke();
}

/** Contiguous runs of bars where every series is finite, as [first, last] pairs. */
export function finiteRuns(bars: BarGeometry, ...series: ValueAt[]): [number, number][] {
  const runs: [number, number][] = [];
  let start = -1;
  for (let i = bars.first; i <= bars.last; i++) {
    const ok = series.every((valueAt) => Number.isFinite(valueAt(i)));
    if (ok && start < 0) start = i;
    if (!ok && start >= 0) {
      runs.push([start, i - 1]);
      start = -1;
    }
  }
  if (start >= 0) runs.push([start, bars.last]);
  return runs;
}

/** A line with a translucent fill down to `baseY`. */
export function drawArea(
  ctx: CanvasRenderingContext2D,
  bars: BarGeometry,
  valueAt: ValueAt,
  y: YMap,
  baseY: number,
  color: string,
  alpha = 0.18,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  for (const [first, last] of finiteRuns(bars, valueAt)) {
    ctx.moveTo(bars.x(first), baseY);
    for (let i = first; i <= last; i++) ctx.lineTo(bars.x(i), y(valueAt(i)));
    ctx.lineTo(bars.x(last), baseY);
    ctx.closePath();
  }
  ctx.fill();
  ctx.restore();
  drawLine(ctx, bars, valueAt, y, color, 2);
}

/** Fills the region between two series (Bollinger Bands), one polygon per finite run. */
export function drawBand(
  ctx: CanvasRenderingContext2D,
  bars: BarGeometry,
  upperAt: ValueAt,
  lowerAt: ValueAt,
  y: YMap,
  color: string,
  alpha = 0.1,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  for (const [first, last] of finiteRuns(bars, upperAt, lowerAt)) {
    ctx.moveTo(bars.x(first), y(upperAt(first)));
    for (let i = first + 1; i <= last; i++) ctx.lineTo(bars.x(i), y(upperAt(i)));
    for (let i = last; i >= first; i--) ctx.lineTo(bars.x(i), y(lowerAt(i)));
    ctx.closePath();
  }
  ctx.fill();
  ctx.restore();
}

/**
 * Columns from `base` to each value in two colours, chosen per bar by
 * `pick(i)` (up/down volume, positive/negative MACD histogram).
 */
export function drawHistogram(
  ctx: CanvasRenderingContext2D,
  bars: BarGeometry,
  valueAt: ValueAt,
  y: YMap,
  base: number,
  colors: readonly [string, string],
  pick: (i: number) => 0 | 1,
  alpha = 1,
): void {
  const width = Math.max(1 / bars.dpr, bars.spacing * 0.7);
  const minHeight = 1 / bars.dpr;
  const baseY = y(base);
  ctx.save();
  ctx.globalAlpha = alpha;
  for (const which of [0, 1] as const) {
    ctx.fillStyle = colors[which];
    ctx.beginPath();
    for (let i = bars.first; i <= bars.last; i++) {
      const value = valueAt(i);
      if (!Number.isFinite(value) || pick(i) !== which) continue;
      const top = y(value);
      ctx.rect(bars.x(i) - width / 2, Math.min(top, baseY), width, Math.max(minHeight, Math.abs(baseY - top)));
    }
    ctx.fill();
  }
  ctx.restore();
}
