/**
 * Order-ticket model: the raw form state and its normalization into an
 * `OrderDraft` (OpenSpec add-trading-suite, D7). Pure functions on decimal
 * strings, shared by validation, preview and the component.
 */
import { divideDecimal, isDecimal, multiplyDecimal, signOf } from "../decimal.js";
import { roundToStep, roundToTick, sizePrecisionOf } from "../format.js";
import type { MarginMode, MarketSpec, OrderDraft, OrderType, Side, TimeInForce } from "../types.js";

export type SizeUnit = "base" | "quote";

/** What the user has entered; empty fields are `null`. */
export interface TicketState {
  side: Side;
  type: OrderType;
  price: string | null;
  triggerPrice: string | null;
  size: string | null;
  sizeUnit: SizeUnit;
  leverage: number;
  marginMode: MarginMode;
  reduceOnly: boolean;
  postOnly: boolean;
  timeInForce: TimeInForce;
  takeProfit: string | null;
  stopLoss: string | null;
}

/** Extra digits kept when converting quote → base before rounding down to the step. */
const CONVERSION_GUARD_DIGITS = 2;

export function needsPrice(type: OrderType): boolean {
  return type === "limit" || type === "stop-limit";
}

export function needsTrigger(type: OrderType): boolean {
  return type === "stop-market" || type === "stop-limit";
}

/** A usable positive price, or `undefined`. */
export function positive(value: string | null | undefined): string | undefined {
  return isDecimal(value) && signOf(value) > 0 ? value : undefined;
}

/**
 * The price the order is expected to fill at: the limit price for limit and
 * stop-limit, the trigger for stop-market and `referencePrice` (mark / last)
 * for market orders. `undefined` while it is not known.
 */
export function entryPrice(state: TicketState, referencePrice?: string): string | undefined {
  if (needsPrice(state.type)) return positive(state.price);
  if (state.type === "stop-market") return positive(state.triggerPrice);
  return positive(referencePrice);
}

/** A quote amount converted to base at `entry`, rounded down to `stepSize`. */
export function quoteToBase(quote: string, entry: string, market: MarketSpec): string {
  const digits = sizePrecisionOf(market) + CONVERSION_GUARD_DIGITS;
  return roundToStep(divideDecimal(quote, entry, digits, "down"), market.stepSize, "down");
}

/**
 * The size in base asset, rounded down to `stepSize`. A quote size is divided
 * by `entry` first; `undefined` when there is no size, or no entry price to
 * convert a quote size.
 */
export function baseSize(state: TicketState, market: MarketSpec, entry?: string): string | undefined {
  const size = positive(state.size);
  if (size === undefined) return undefined;
  if (state.sizeUnit === "base") return roundToStep(size, market.stepSize, "down");
  return entry === undefined ? undefined : quoteToBase(size, entry, market);
}

/** Notional value in quote asset: base size × entry price (exact). */
export function notionalOf(base: string | undefined, entry: string | undefined): string | undefined {
  return base !== undefined && entry !== undefined ? multiplyDecimal(base, entry) : undefined;
}

function roundedPrice(value: string | null, market: MarketSpec): string | undefined {
  const price = positive(value);
  return price === undefined ? undefined : roundToTick(price, market.tickSize, "nearest");
}

/**
 * The `OrderDraft` handed to `onsubmit`: prices rounded to `tickSize`
 * (nearest), size rounded down to `stepSize` in base asset, and only the
 * fields the order type uses. Returns `undefined` when there is no size.
 */
export function normalizeDraft(
  state: TicketState,
  market: MarketSpec,
  referencePrice?: string,
): OrderDraft | undefined {
  const size = baseSize(state, market, entryPrice(state, referencePrice));
  if (size === undefined) return undefined;
  const draft: OrderDraft = {
    market: market.symbol,
    side: state.side,
    type: state.type,
    size,
    sizeUnit: "base",
    leverage: state.leverage,
    marginMode: state.marginMode,
    reduceOnly: state.reduceOnly,
    postOnly: state.type === "limit" && state.postOnly,
    timeInForce: state.timeInForce,
  };
  const optional: Partial<OrderDraft> = {
    price: needsPrice(state.type) ? roundedPrice(state.price, market) : undefined,
    triggerPrice: needsTrigger(state.type) ? roundedPrice(state.triggerPrice, market) : undefined,
    takeProfit: roundedPrice(state.takeProfit, market),
    stopLoss: roundedPrice(state.stopLoss, market),
  };
  for (const [key, value] of Object.entries(optional)) {
    if (value !== undefined) Object.assign(draft, { [key]: value });
  }
  return draft;
}
