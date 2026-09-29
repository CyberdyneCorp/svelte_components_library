/**
 * Keyboard editing of draggable price lines, the accessible alternative to
 * dragging them: select a line, move it by ticks, then commit or cancel.
 * Pure helpers; `ChartEngine` holds the edit state.
 */
import type { MarketSpec, PriceLine } from "../../types.js";
import { snapPrice } from "./hitTest.js";
import { autoDigits } from "./numberFormat.js";
import { priceLineId } from "./scene.js";

/** Ticks moved by Shift+↑/↓. */
export const LARGE_STEP = 10;

export type PriceLineEditPhase = "select" | "move" | "commit" | "cancel";

/** A keyboard edit step, reported so the chart can announce it. */
export interface PriceLineEdit {
  phase: PriceLineEditPhase;
  id: string;
  /** Draft price (select, move, commit) or the unchanged price (cancel). */
  price: number;
  line: PriceLine;
}

/** One tick: the market's `tickSize`, else the smallest step shown at this price's magnitude. */
export function tickStep(price: number, market: MarketSpec | undefined): number {
  return market ? Number(market.tickSize) : 10 ** -autoDigits(price);
}

/** `price` moved by `ticks` ticks and snapped to the tick grid. */
export function nudgedPrice(price: number, ticks: number, market: MarketSpec | undefined): number {
  return snapPrice(price + ticks * tickStep(price, market), market);
}

/** Ids of the draggable lines, in the order given. */
export function draggableIds(lines: readonly PriceLine[]): string[] {
  return lines.flatMap((line, i) => (line.draggable ? [priceLineId(line, i)] : []));
}

/**
 * Id of the draggable line `step` places after `current`, wrapping around;
 * without a current line, the first (step 1) or last (step −1).
 */
export function nextDraggable(lines: readonly PriceLine[], current: string | null, step: 1 | -1): string | null {
  const ids = draggableIds(lines);
  if (ids.length === 0) return null;
  const at = current === null ? -1 : ids.indexOf(current);
  if (at < 0) return step === 1 ? ids[0] : ids[ids.length - 1];
  return ids[(at + step + ids.length) % ids.length];
}

/** The line with this id (explicit `id` or positional id). */
export function findPriceLine(lines: readonly PriceLine[], id: string): PriceLine | undefined {
  return lines.find((line, i) => priceLineId(line, i) === id);
}
