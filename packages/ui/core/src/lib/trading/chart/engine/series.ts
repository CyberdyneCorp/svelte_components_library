/**
 * Classifies a new `candles` array against the previous one so live updates
 * are applied incrementally (design D3): replacing the last bar or appending
 * bars only touches the tail; anything else is a full reset.
 */
import type { Candle } from "../../types.js";

/** What the engine remembers about the previous series (not the array itself). */
export interface SeriesSnapshot {
  length: number;
  firstTime: number;
  lastTime: number;
}

export type SeriesChange =
  | { kind: "reset" }
  /** The last bar was replaced (same time). */
  | { kind: "update" }
  /** `count` bars were appended; the previous last bar may have been revised too. */
  | { kind: "append"; count: number };

export function snapshotOf(candles: readonly Candle[]): SeriesSnapshot | null {
  if (candles.length === 0) return null;
  return { length: candles.length, firstTime: candles[0].time, lastTime: candles[candles.length - 1].time };
}

export function classifyChange(prev: SeriesSnapshot | null, next: readonly Candle[]): SeriesChange {
  if (!prev || next.length < prev.length || next[0]?.time !== prev.firstTime) return { kind: "reset" };
  if (next[prev.length - 1].time !== prev.lastTime) return { kind: "reset" };
  if (next.length === prev.length) return { kind: "update" };
  return { kind: "append", count: next.length - prev.length };
}

/** Index of the bar with `time`, or of the last bar opening before it; -1 before the first bar. */
export function indexAtTime(candles: readonly Candle[], time: number): number {
  let lo = 0;
  let hi = candles.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (candles[mid].time <= time) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}
