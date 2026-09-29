/** Trade markers and horizontal price lines (design D5). */
import type { ChartMarker } from "../../types.js";
import { crisp } from "../engine/surface.js";
import { drawPriceLabel } from "./axes.js";
import { dashFor, FONT_SIZE, fontOf, type Box, type LineStyle } from "./types.js";

/** A marker resolved to pixels: `y` is the anchor (bar high, low or close). */
export interface PlacedMarker {
  x: number;
  y: number;
  shape: ChartMarker["shape"];
  position: ChartMarker["position"];
  color: string;
  text?: string;
}

export const MARKER_SIZE = 8;
const MARKER_GAP = 4;

/** Centre of the marker shape: above the high, below the low, or on the close. */
export function markerCentre(marker: PlacedMarker, size = MARKER_SIZE): number {
  if (marker.position === "above") return marker.y - MARKER_GAP - size / 2;
  if (marker.position === "below") return marker.y + MARKER_GAP + size / 2;
  return marker.y;
}

function traceShape(ctx: CanvasRenderingContext2D, shape: PlacedMarker["shape"], x: number, y: number, size: number) {
  const h = size / 2;
  switch (shape) {
    case "arrow-up":
      ctx.moveTo(x, y - h);
      ctx.lineTo(x + h, y + h);
      ctx.lineTo(x - h, y + h);
      ctx.closePath();
      break;
    case "arrow-down":
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + h, y - h);
      ctx.lineTo(x - h, y - h);
      ctx.closePath();
      break;
    case "circle":
      ctx.moveTo(x + h, y);
      ctx.arc(x, y, h, 0, Math.PI * 2);
      break;
    case "square":
      ctx.rect(x - h, y - h, size, size);
      break;
  }
}

/** Filled marker shapes with optional text beyond them (away from the bar). */
export function drawMarkers(
  ctx: CanvasRenderingContext2D,
  markers: readonly PlacedMarker[],
  font: string,
  size = MARKER_SIZE,
): void {
  ctx.font = fontOf(font);
  ctx.textAlign = "center";
  for (const marker of markers) {
    const cy = markerCentre(marker, size);
    ctx.fillStyle = marker.color;
    ctx.beginPath();
    traceShape(ctx, marker.shape, marker.x, cy, size);
    ctx.fill();
    if (!marker.text) continue;
    const below = marker.position === "below";
    ctx.textBaseline = below ? "top" : "bottom";
    const offset = size / 2 + 2;
    ctx.fillText(marker.text, marker.x, below ? cy + offset : cy - offset);
  }
}

/** A price line resolved to pixels. */
export interface PlacedPriceLine {
  y: number;
  color: string;
  style: LineStyle;
  /** Text at the left end of the line (label, e.g. "TP"). */
  label: string;
  /** Formatted price for the axis label. */
  priceText: string;
  /** Drawn thicker while hovered or dragged. */
  active?: boolean;
}

/** Horizontal lines across the plot with a left label and a price label on the axis. */
export function drawPriceLines(
  ctx: CanvasRenderingContext2D,
  lines: readonly PlacedPriceLine[],
  plot: Box,
  axis: Box,
  labelText: string,
  font: string,
  dpr: number,
): void {
  for (const line of lines) {
    if (line.y < plot.top || line.y > plot.top + plot.height) continue;
    const y = crisp(line.y, dpr);
    ctx.save();
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.active ? 2 : 1;
    ctx.setLineDash(dashFor(line.style));
    ctx.beginPath();
    ctx.moveTo(plot.left, y);
    ctx.lineTo(plot.left + plot.width, y);
    ctx.stroke();
    ctx.restore();
    if (line.label) drawLineLabel(ctx, plot.left + 4, y, line.label, line.color, labelText, font);
    drawPriceLabel(ctx, axis, y, { text: line.priceText, background: line.color, color: labelText, font });
  }
}

/** A small filled tag sitting on the line. */
function drawLineLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  background: string,
  color: string,
  font: string,
): void {
  ctx.font = fontOf(font);
  const width = ctx.measureText(text).width + 8;
  const height = FONT_SIZE + 4;
  ctx.fillStyle = background;
  ctx.fillRect(x, y - height / 2, width, height);
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 4, y);
}
