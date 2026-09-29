/**
 * Order-book model for `OrderBook` (OpenSpec add-trading-suite, D8).
 *
 * Aggregation uses decimal-string maths only. Bids group **down** and asks
 * group **up** to the grouping step, so a grouped level never looks better
 * than the orders inside it: bids 63999.5 and 63999.0 with grouping "1" become
 * one 63999 bid, asks 64000.5 and 64001.0 become one 64001 ask.
 */
import { roundToTick } from "../format.js";
import type { BookLevel } from "../types.js";
import {
  commonScale,
  compareDecimal,
  isDecimal,
  isMultipleOf,
  multiplyByInteger,
  scaled,
  signOf,
  subtractDecimal,
  unscaled,
} from "../decimal.js";

export type BookSide = "bid" | "ask";
export type OrderBookLayout = "both" | "bids" | "asks";

/** One displayed level: grouped price, summed size, running total and depth (0–1). */
export interface BookRow {
  price: string;
  size: string;
  total: string;
  depth: number;
}

export interface BookSpread {
  /** Best ask − best bid; zero or negative when the book is crossed. */
  absolute: string;
  /** `absolute` as a percentage of the mid price. */
  percent: number;
  crossed: boolean;
}

export interface BookView {
  bids: BookRow[];
  asks: BookRow[];
  spread: BookSpread | null;
}

export interface BuildBookOptions {
  bids: readonly BookLevel[];
  asks: readonly BookLevel[];
  grouping: string;
  /** Levels shown per side. */
  levels: number;
}

const ZERO = BigInt(0);
const DEFAULT_FACTORS = [1, 10, 100, 1000];

/** A level worth showing: decimal price and a positive decimal size (size "0" deletes a level). */
export function isLiveLevel(level: BookLevel | null | undefined): level is BookLevel {
  return !!level && isDecimal(level.price) && isDecimal(level.size) && signOf(level.size) > 0;
}

function bestFirst(side: BookSide) {
  return side === "bid"
    ? (a: BookLevel, b: BookLevel) => compareDecimal(b.price, a.price)
    : (a: BookLevel, b: BookLevel) => compareDecimal(a.price, b.price);
}

/**
 * Buckets levels by `grouping` (bids round down, asks round up) and sums
 * their sizes exactly. Returns best price first; empty or invalid levels are
 * dropped.
 */
export function groupLevels(
  levels: readonly BookLevel[],
  grouping: string,
  side: BookSide,
): BookLevel[] {
  const live = levels.filter(isLiveLevel);
  const scale = commonScale(live.map((level) => level.size));
  const mode = side === "bid" ? "down" : "up";
  const buckets = new Map<string, bigint>();
  for (const level of live) {
    const key = roundToTick(level.price, grouping, mode);
    buckets.set(key, (buckets.get(key) ?? ZERO) + scaled(level.size, scale));
  }
  return [...buckets]
    .map(([price, units]) => ({ price, size: unscaled(units, scale) }))
    .sort(bestFirst(side));
}

/** Running totals in scaled units, one per level. */
function runningTotals(levels: readonly BookLevel[], scale: number): bigint[] {
  let sum = ZERO;
  return levels.map((level) => (sum += scaled(level.size, scale)));
}

function toRows(levels: readonly BookLevel[], totals: bigint[], scale: number, max: bigint) {
  return levels.map((level, i) => ({
    price: level.price,
    size: level.size,
    total: unscaled(totals[i], scale),
    depth: max > ZERO ? Number(totals[i]) / Number(max) : 0,
  }));
}

/** Best live level of a side, whatever the input order. */
export function bestLevel(levels: readonly BookLevel[], side: BookSide): BookLevel | undefined {
  const order = bestFirst(side);
  return levels
    .filter(isLiveLevel)
    .reduce<BookLevel | undefined>((best, level) => (!best || order(level, best) < 0 ? level : best), undefined);
}

/** Spread between the best bid and ask, or `null` when either side is empty. */
export function computeSpread(bestBid?: BookLevel, bestAsk?: BookLevel): BookSpread | null {
  if (!bestBid || !bestAsk) return null;
  const absolute = subtractDecimal(bestAsk.price, bestBid.price);
  const mid = (Number(bestAsk.price) + Number(bestBid.price)) / 2;
  const percent = mid > 0 ? (Number(absolute) / mid) * 100 : 0;
  return { absolute, percent, crossed: signOf(absolute) <= 0 };
}

/**
 * Groups both sides, keeps `levels` per side and adds cumulative totals.
 * Depth is relative to the larger of the two sides' final totals, so bars on
 * both sides share one scale.
 */
export function buildBook({ bids, asks, grouping, levels }: BuildBookOptions): BookView {
  const count = Math.max(0, Math.floor(levels));
  const bidLevels = groupLevels(bids, grouping, "bid").slice(0, count);
  const askLevels = groupLevels(asks, grouping, "ask").slice(0, count);
  const scale = commonScale([...bidLevels, ...askLevels].map((level) => level.size));
  const bidTotals = runningTotals(bidLevels, scale);
  const askTotals = runningTotals(askLevels, scale);
  const lastBid = bidTotals.at(-1) ?? ZERO;
  const lastAsk = askTotals.at(-1) ?? ZERO;
  const max = lastBid > lastAsk ? lastBid : lastAsk;
  return {
    bids: toRows(bidLevels, bidTotals, scale, max),
    asks: toRows(askLevels, askTotals, scale, max),
    spread: computeSpread(bestLevel(bids, "bid"), bestLevel(asks, "ask")),
  };
}

/** Default grouping choices: the tick size × 1, 10, 100 and 1000. */
export function defaultGroupingOptions(tickSize: string): string[] {
  return DEFAULT_FACTORS.map((factor) => multiplyByInteger(tickSize, factor));
}

/** `grouping` when it is a positive multiple of `tickSize`, otherwise the tick size. */
export function resolveGrouping(grouping: string | undefined, tickSize: string): string {
  return grouping !== undefined && isMultipleOf(grouping, tickSize) ? grouping : tickSize;
}

/** Drops trailing fraction zeros for display in the grouping control ("0.10" → "0.1"). */
export function trimZeros(value: string): string {
  return value.includes(".") ? value.replace(/\.?0+$/, "") : value;
}
