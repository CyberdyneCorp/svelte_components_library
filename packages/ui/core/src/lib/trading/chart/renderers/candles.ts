/** Candlestick, hollow-candle and OHLC-bar renderers. */
import type { Candle } from "../../types.js";
import { crisp, snap } from "../engine/surface.js";
import type { BarGeometry, YMap } from "./types.js";

export interface CandleColors {
  up: string;
  down: string;
}

export const isUp = (candle: Candle) => candle.close >= candle.open;

/** Body width: about 70% of the slot, an odd number of device pixels so the wick is centred. */
export function bodyWidth(spacing: number, dpr: number): number {
  const device = Math.max(1, Math.floor(spacing * 0.7 * dpr));
  return (device % 2 === 0 ? device - 1 : device) / dpr;
}

/** Wicks as two segments (above and below the body), so hollow bodies stay empty. */
function traceWicks(
  ctx: CanvasRenderingContext2D,
  candles: readonly Candle[],
  bars: BarGeometry,
  y: YMap,
  up: boolean,
): void {
  ctx.beginPath();
  for (let i = bars.first; i <= bars.last; i++) {
    const c = candles[i];
    if (isUp(c) !== up) continue;
    const x = crisp(bars.x(i), bars.dpr);
    ctx.moveTo(x, y(c.high));
    ctx.lineTo(x, y(Math.max(c.open, c.close)));
    ctx.moveTo(x, y(Math.min(c.open, c.close)));
    ctx.lineTo(x, y(c.low));
  }
  ctx.stroke();
}

function traceBodies(
  ctx: CanvasRenderingContext2D,
  candles: readonly Candle[],
  bars: BarGeometry,
  y: YMap,
  up: boolean,
): void {
  const width = bodyWidth(bars.spacing, bars.dpr);
  const minHeight = 1 / bars.dpr;
  ctx.beginPath();
  for (let i = bars.first; i <= bars.last; i++) {
    const c = candles[i];
    if (isUp(c) !== up) continue;
    const top = snap(y(Math.max(c.open, c.close)), bars.dpr);
    const bottom = snap(y(Math.min(c.open, c.close)), bars.dpr);
    const left = snap(bars.x(i) - width / 2, bars.dpr);
    ctx.rect(left, top, width, Math.max(minHeight, bottom - top));
  }
}

/**
 * Candles in two passes (up, then down), so the whole series costs four
 * canvas draw calls. `hollow` strokes up bodies instead of filling them.
 */
export function drawCandles(
  ctx: CanvasRenderingContext2D,
  candles: readonly Candle[],
  bars: BarGeometry,
  y: YMap,
  colors: CandleColors,
  hollow = false,
): void {
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  for (const up of [true, false]) {
    const color = up ? colors.up : colors.down;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    traceWicks(ctx, candles, bars, y, up);
    traceBodies(ctx, candles, bars, y, up);
    if (hollow && up) ctx.stroke();
    else ctx.fill();
  }
}

/** OHLC bars: a high-low line with the open tick on the left and the close tick on the right. */
export function drawOhlcBars(
  ctx: CanvasRenderingContext2D,
  candles: readonly Candle[],
  bars: BarGeometry,
  y: YMap,
  colors: CandleColors,
): void {
  const tick = Math.max(1, bodyWidth(bars.spacing, bars.dpr) / 2);
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  for (const up of [true, false]) {
    ctx.strokeStyle = up ? colors.up : colors.down;
    ctx.beginPath();
    for (let i = bars.first; i <= bars.last; i++) {
      const c = candles[i];
      if (isUp(c) !== up) continue;
      const x = crisp(bars.x(i), bars.dpr);
      const open = crisp(y(c.open), bars.dpr);
      const close = crisp(y(c.close), bars.dpr);
      ctx.moveTo(x, y(c.high));
      ctx.lineTo(x, y(c.low));
      ctx.moveTo(x - tick, open);
      ctx.lineTo(x, open);
      ctx.moveTo(x, close);
      ctx.lineTo(x + tick, close);
    }
    ctx.stroke();
  }
}
