/** Crosshair lines and the OHLCV / indicator legend. */
import { crisp } from "../engine/surface.js";
import { FONT_SIZE, fontOf, type Box } from "./types.js";

/**
 * Dashed crosshair: a vertical line at `x` through every pane (`plot`) and,
 * when `y` is given, a horizontal line across the plot.
 */
export function drawCrosshair(
  ctx: CanvasRenderingContext2D,
  plot: Box,
  x: number,
  y: number | null,
  color: string,
  dpr: number,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  const cx = crisp(x, dpr);
  ctx.moveTo(cx, plot.top);
  ctx.lineTo(cx, plot.top + plot.height);
  if (y !== null) {
    const cy = crisp(y, dpr);
    ctx.moveTo(plot.left, cy);
    ctx.lineTo(plot.left + plot.width, cy);
  }
  ctx.stroke();
  ctx.restore();
}

export interface LegendSegment {
  text: string;
  color: string;
}

export type LegendRow = readonly LegendSegment[];

export const LEGEND_LINE_HEIGHT = FONT_SIZE + 5;

/**
 * Rows of coloured text segments, top-left at (x, y), each row separated by
 * LEGEND_LINE_HEIGHT; segments are separated by one space.
 */
export function drawLegend(
  ctx: CanvasRenderingContext2D,
  rows: readonly LegendRow[],
  x: number,
  y: number,
  font: string,
): void {
  ctx.font = fontOf(font);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const space = ctx.measureText(" ").width;
  rows.forEach((row, r) => {
    let left = x;
    for (const segment of row) {
      ctx.fillStyle = segment.color;
      ctx.fillText(segment.text, left, y + r * LEGEND_LINE_HEIGHT);
      left += ctx.measureText(segment.text).width + space;
    }
  });
}
