/**
 * Order-ticket preview (OpenSpec add-trading-suite, D7): notional, initial
 * margin and estimated fee as decimal strings in the quote asset.
 *
 * Fee rate: `makerFee` only for post-only limit orders (they can only add
 * liquidity); every other order — market, stop, IOC / FOK and plain GTC
 * limits, which may cross the book — uses `takerFee`, so the estimate is
 * never lower than what the exchange can charge.
 */
import { divideDecimal, multiplyDecimal } from "../decimal.js";
import type { MarketSpec } from "../types.js";
import { baseSize, entryPrice, notionalOf, type TicketState } from "./ticket.js";

export interface PreviewInput {
  market: MarketSpec;
  referencePrice?: string;
  makerFee?: string;
  takerFee?: string;
  /** Fraction digits of quote amounts (margin is rounded up, the rest nearest). */
  quoteDecimals: number;
}

export interface OrderPreview {
  /** Base size after step rounding. */
  size?: string;
  notional?: string;
  initialMargin?: string;
  fee?: string;
  /** The rate the fee was estimated with. */
  feeRate?: string;
  feeKind?: "maker" | "taker";
}

export function feeKindOf(state: Pick<TicketState, "type" | "postOnly">): "maker" | "taker" {
  return state.type === "limit" && state.postOnly ? "maker" : "taker";
}

function feeOf(notional: string, state: TicketState, input: PreviewInput): Partial<OrderPreview> {
  const feeKind = feeKindOf(state);
  const feeRate = feeKind === "maker" ? input.makerFee : input.takerFee;
  if (feeRate === undefined) return {};
  const exact = multiplyDecimal(notional, feeRate);
  return { feeKind, feeRate, fee: divideDecimal(exact, "1", input.quoteDecimals, "up") };
}

function marginOf(notional: string, leverage: number, digits: number): string | undefined {
  if (!Number.isInteger(leverage) || leverage < 1) return undefined;
  return divideDecimal(notional, String(leverage), digits, "up");
}

export function previewOrder(state: TicketState, input: PreviewInput): OrderPreview {
  const entry = entryPrice(state, input.referencePrice);
  const size = baseSize(state, input.market, entry);
  const exact = notionalOf(size, entry);
  if (exact === undefined) return { size };
  return {
    size,
    notional: divideDecimal(exact, "1", input.quoteDecimals, "nearest"),
    initialMargin: marginOf(exact, state.leverage, input.quoteDecimals),
    ...feeOf(exact, state, input),
  };
}
