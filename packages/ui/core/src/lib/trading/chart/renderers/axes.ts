/** Grid, axes, axis label boxes, horizontal guides and the last-price label. */
import { crisp } from "../engine/surface.js";
import { dashFor, FONT_SIZE, fontOf, type Box, type LineStyle } from "./types.js";

export interface AxisTick {
  /** Pixel position along the axis (y for the price axis, x for the time axis). */
  at: number;
  text: string;
}

export interface TextStyle {
  color: string;
  font: string;
}

/** Horizontal lines at `ys` and vertical lines at `xs`, clipped to `box`. */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  box: Box,
  ys: readonly number[],
  xs: readonly number[],
  color: string,
  dpr: number,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1 / dpr;
  ctx.setLineDash([]);
  ctx.beginPath();
  for (const y of ys) {
    const cy = crisp(y, dpr);
    ctx.moveTo(box.left, cy);
    ctx.lineTo(box.left + box.width, cy);
  }
  for (const x of xs) {
    const cx = crisp(x, dpr);
    ctx.moveTo(cx, box.top);
    ctx.lineTo(cx, box.top + box.height);
  }
  ctx.stroke();
}

/** Horizontal guide lines (e.g. RSI 30 / 70) across `box`. */
export function drawGuides(
  ctx: CanvasRenderingContext2D,
  box: Box,
  ys: readonly number[],
  color: string,
  dpr: number,
  style: LineStyle = "dashed",
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash(dashFor(style));
  ctx.beginPath();
  for (const y of ys) {
    const cy = crisp(y, dpr);
    ctx.moveTo(box.left, cy);
    ctx.lineTo(box.left + box.width, cy);
  }
  ctx.stroke();
  ctx.restore();
}

/** Price labels left-aligned in the axis gutter, plus the gutter's border line. */
export function drawPriceAxis(
  ctx: CanvasRenderingContext2D,
  axis: Box,
  ticks: readonly AxisTick[],
  text: TextStyle,
  borderColor: string,
  dpr: number,
): void {
  drawGrid(ctx, axis, [], [axis.left], borderColor, dpr);
  ctx.fillStyle = text.color;
  ctx.font = fontOf(text.font);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (const tick of ticks) ctx.fillText(tick.text, axis.left + 6, tick.at);
}

/** Time labels centred under their bars, plus the gutter's border line. */
export function drawTimeAxis(
  ctx: CanvasRenderingContext2D,
  axis: Box,
  ticks: readonly AxisTick[],
  text: TextStyle,
  borderColor: string,
  dpr: number,
): void {
  drawGrid(ctx, axis, [axis.top], [], borderColor, dpr);
  ctx.fillStyle = text.color;
  ctx.font = fontOf(text.font);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const y = axis.top + axis.height / 2;
  for (const tick of ticks) ctx.fillText(tick.text, tick.at, y);
}

export interface AxisLabel {
  text: string;
  background: string;
  color: string;
  font: string;
}

const LABEL_PAD = 4;
const LABEL_HEIGHT = FONT_SIZE + 2 * LABEL_PAD;

/** A filled label box on the price axis, vertically centred on `y` and clamped inside `axis`. */
export function drawPriceLabel(ctx: CanvasRenderingContext2D, axis: Box, y: number, label: AxisLabel): void {
  const top = Math.min(axis.top + axis.height - LABEL_HEIGHT, Math.max(axis.top, y - LABEL_HEIGHT / 2));
  ctx.fillStyle = label.background;
  ctx.fillRect(axis.left, top, axis.width, LABEL_HEIGHT);
  ctx.fillStyle = label.color;
  ctx.font = fontOf(label.font);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label.text, axis.left + 6, top + LABEL_HEIGHT / 2);
}

/** A filled label box on the time axis, horizontally centred on `x` and clamped inside `axis`. */
export function drawTimeLabel(ctx: CanvasRenderingContext2D, axis: Box, x: number, label: AxisLabel): void {
  ctx.font = fontOf(label.font);
  const width = ctx.measureText(label.text).width + 2 * LABEL_PAD + 4;
  const left = Math.min(axis.left + axis.width - width, Math.max(axis.left, x - width / 2));
  ctx.fillStyle = label.background;
  ctx.fillRect(left, axis.top, width, axis.height);
  ctx.fillStyle = label.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label.text, left + width / 2, axis.top + axis.height / 2);
}

/** Dotted line across the plot at the last price, with its value on the axis. */
export function drawLastPrice(
  ctx: CanvasRenderingContext2D,
  plot: Box,
  axis: Box,
  y: number,
  label: AxisLabel,
  dpr: number,
): void {
  drawGuides(ctx, plot, [y], label.background, dpr, "dotted");
  drawPriceLabel(ctx, axis, y, label);
}
