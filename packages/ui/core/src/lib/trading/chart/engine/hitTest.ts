/** Pointer hit-testing and price snapping for dragging price lines. */
import { precisionOf, roundToTick } from "../../format.js";
import type { MarketSpec } from "../../types.js";
import type { Frame } from "./frame.js";
import { hitSeparator } from "./layout.js";
import { autoDigits } from "./numberFormat.js";
import { priceLineId, type Scene } from "./scene.js";

export type Hit =
  | { kind: "separator"; index: number }
  | { kind: "price-line"; id: string }
  | { kind: "plot" }
  | { kind: "axis" }
  | { kind: "none" };

/** Vertical distance within which a draggable price line is grabbed. */
export const PRICE_LINE_HIT = 5;

export function hitTest(frame: Frame, scene: Scene, x: number, y: number): Hit {
  const { layout } = frame;
  const separator = hitSeparator(layout, x, y);
  if (separator >= 0) return { kind: "separator", index: separator };
  const line = hitPriceLine(frame, scene, x, y);
  if (line) return { kind: "price-line", id: line };
  if (y >= layout.timeAxis.top || x > layout.width || y < 0 || x < 0) return { kind: "none" };
  return x > layout.plotWidth ? { kind: "axis" } : { kind: "plot" };
}

/** Id of the nearest draggable price line within PRICE_LINE_HIT px, over the main pane. */
export function hitPriceLine(frame: Frame, scene: Scene, x: number, y: number): string | null {
  const main = frame.panes[0];
  if (!main || x < 0 || x > frame.layout.width) return null;
  let best: string | null = null;
  let bestDistance = PRICE_LINE_HIT;
  scene.priceLines.forEach((line, i) => {
    if (!line.draggable) return;
    const distance = Math.abs(main.scale.priceToY(line.price) - y);
    if (distance <= bestDistance) {
      bestDistance = distance;
      best = priceLineId(line, i);
    }
  });
  return best;
}

/**
 * Snaps a chart price to the market tick (decimal-string maths through
 * `roundToTick`), or to a magnitude-based precision without a market.
 */
export function snapPrice(price: number, market: MarketSpec | undefined): number {
  if (!Number.isFinite(price)) return price;
  if (!market) {
    const digits = autoDigits(price);
    return Number(price.toFixed(digits));
  }
  const digits = Math.min(20, precisionOf(market.tickSize) + 6);
  return Number(roundToTick(price.toFixed(digits), market.tickSize));
}
