/**
 * Size helpers for the order ticket: the size-percentage slider (a share of
 * `available` margin × leverage) and base ⇄ quote conversion. Decimal
 * strings only; sizes are always rounded down.
 */
import { compareDecimal, divideDecimal, multiplyDecimal, signOf } from "../decimal.js";
import type { MarketSpec } from "../types.js";
import { positive, quoteToBase, type SizeUnit } from "./ticket.js";

export interface SizingContext {
  market: MarketSpec;
  /** Expected fill price (see `entryPrice`). */
  entry?: string;
  available?: string;
  leverage: number;
  quoteDecimals: number;
}

/** Buying power in quote asset: available margin × leverage. */
function buyingPower(ctx: SizingContext): string | undefined {
  const available = positive(ctx.available);
  if (available === undefined || !Number.isInteger(ctx.leverage) || ctx.leverage < 1) {
    return undefined;
  }
  return multiplyDecimal(available, String(ctx.leverage));
}

/**
 * The size for `percent` (0–100) of the buying power, in `unit`, or `null`
 * when it cannot be computed (no available margin, or no entry price for a
 * base size).
 */
export function sizeForPercent(percent: number, unit: SizeUnit, ctx: SizingContext): string | null {
  const power = buyingPower(ctx);
  if (power === undefined) return null;
  const share = Math.min(100, Math.max(0, Math.round(percent)));
  const quote = divideDecimal(multiplyDecimal(power, String(share)), "100", ctx.quoteDecimals);
  if (unit === "quote") return quote;
  return ctx.entry === undefined ? null : quoteToBase(quote, ctx.entry, ctx.market);
}

/** The whole percentage (0–100) of the buying power a quote notional uses. */
export function percentOfPower(notional: string | undefined, ctx: SizingContext): number {
  const power = buyingPower(ctx);
  if (power === undefined || notional === undefined || signOf(notional) <= 0) return 0;
  if (compareDecimal(notional, power) >= 0) return 100;
  // A 0–100 integer string: safe to read as a number.
  return Number(divideDecimal(multiplyDecimal(notional, "100"), power, 0, "nearest"));
}

/**
 * Converts a size between base and quote at `entry`. Returns `null` when the
 * size is empty or there is no entry price to convert with.
 */
export function convertSize(
  size: string | null,
  to: SizeUnit,
  ctx: Pick<SizingContext, "market" | "entry" | "quoteDecimals">,
): string | null {
  const value = positive(size);
  if (value === undefined || ctx.entry === undefined) return null;
  if (to === "base") return quoteToBase(value, ctx.entry, ctx.market);
  return divideDecimal(multiplyDecimal(value, ctx.entry), "1", ctx.quoteDecimals);
}
