/** Pure helpers for `RecentTrades`: ordering, fresh-trade detection and windowing. */
import type { Trade } from "../types.js";

/** Trades newest first. Returns the input untouched when it is already ordered. */
export function newestFirst(trades: readonly Trade[]): readonly Trade[] {
  const ordered = trades.every((trade, i) => i === 0 || trades[i - 1].time >= trade.time);
  return ordered ? trades : [...trades].sort((a, b) => b.time - a.time);
}

/**
 * Ids of trades that were not in `previous`. New trades arrive at the top of
 * a newest-first list, so the scan stops at the first known id.
 */
export function freshTradeIds(
  previous: ReadonlySet<string>,
  trades: readonly Trade[],
): Set<string> {
  const fresh = new Set<string>();
  for (const trade of trades) {
    if (previous.has(trade.id)) break;
    fresh.add(trade.id);
  }
  return fresh;
}

export interface ListWindow {
  start: number;
  end: number;
  padTop: number;
  padBottom: number;
}

/** Rows to render for a fixed-row-height list scrolled to `scrollTop`. */
export function listWindow(
  count: number,
  scrollTop: number,
  viewport: number,
  rowHeight: number,
  overscan: number,
): ListWindow {
  const first = Math.floor(Math.max(0, scrollTop) / rowHeight);
  const start = Math.max(0, first - overscan);
  const end = Math.min(count, Math.ceil((scrollTop + viewport) / rowHeight) + overscan);
  return {
    start,
    end: Math.max(start, end),
    padTop: start * rowHeight,
    padBottom: Math.max(0, count - Math.max(start, end)) * rowHeight,
  };
}
