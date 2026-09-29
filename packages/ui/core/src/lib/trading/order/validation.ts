/**
 * Order-ticket validation (OpenSpec add-trading-suite, D7): one message per
 * field, taken from the ticket labels. Any error blocks submit.
 */
import { compareDecimal, divideDecimal, isDecimal, signOf } from "../decimal.js";
import type { MarketSpec, Side } from "../types.js";
import type { OrderTicketLabels } from "./labels.js";
import {
  baseSize,
  entryPrice,
  needsPrice,
  needsTrigger,
  notionalOf,
  type TicketState,
} from "./ticket.js";

export type TicketField =
  | "price"
  | "triggerPrice"
  | "size"
  | "leverage"
  | "takeProfit"
  | "stopLoss";

export type TicketErrors = Partial<Record<TicketField, string>>;

export interface ValidationContext {
  market: MarketSpec;
  labels: OrderTicketLabels;
  /** Available margin in quote asset; the initial margin may not exceed it. */
  available?: string;
  /** Mark / last price used as the entry of market orders. */
  referencePrice?: string;
}

/** Fraction digits used when comparing a margin requirement against `available`. */
const MARGIN_DIGITS = 18;

function priceError(value: string | null, required: boolean, labels: OrderTicketLabels) {
  if (value === null || value.trim() === "") return required ? labels.errorRequired : undefined;
  if (!isDecimal(value) || signOf(value) <= 0) return labels.errorPositive;
  return undefined;
}

function sizeBoundsError(base: string, ctx: ValidationContext): string | undefined {
  const { market, labels } = ctx;
  if (compareDecimal(base, market.minSize) < 0 || signOf(base) <= 0) {
    return labels.errorMinSize(`${market.minSize} ${market.baseAsset}`);
  }
  if (market.maxSize !== undefined && compareDecimal(base, market.maxSize) > 0) {
    return labels.errorMaxSize(`${market.maxSize} ${market.baseAsset}`);
  }
  return undefined;
}

function notionalError(notional: string, state: TicketState, ctx: ValidationContext) {
  const { market, labels, available } = ctx;
  if (market.minNotional !== undefined && compareDecimal(notional, market.minNotional) < 0) {
    return labels.errorMinNotional(`${market.minNotional} ${market.quoteAsset}`);
  }
  if (available === undefined || state.reduceOnly || !validLeverage(state.leverage, market)) {
    return undefined;
  }
  const margin = divideDecimal(notional, String(state.leverage), MARGIN_DIGITS, "up");
  return compareDecimal(margin, available) > 0 ? labels.errorInsufficientMargin : undefined;
}

function sizeError(state: TicketState, ctx: ValidationContext): string | undefined {
  const { labels } = ctx;
  const raw = priceError(state.size, true, labels);
  if (raw !== undefined) return raw;
  const entry = entryPrice(state, ctx.referencePrice);
  const base = baseSize(state, ctx.market, entry);
  if (base === undefined) {
    // Only a quote size without an entry price gets here.
    return needsPrice(state.type) || state.type === "stop-market"
      ? undefined // the missing price is reported on its own field
      : labels.errorNoReferencePrice;
  }
  const bounds = sizeBoundsError(base, ctx);
  if (bounds !== undefined) return bounds;
  const notional = notionalOf(base, entry);
  return notional === undefined ? undefined : notionalError(notional, state, ctx);
}

function validLeverage(leverage: number, market: MarketSpec): boolean {
  return Number.isInteger(leverage) && leverage >= 1 && leverage <= market.maxLeverage;
}

/**
 * Take profit must be above the entry for a long and below it for a short;
 * a stop loss the reverse. Skipped while the entry price is unknown.
 */
function exitError(
  kind: "takeProfit" | "stopLoss",
  value: string | null,
  side: Side,
  entry: string | undefined,
  labels: OrderTicketLabels,
): string | undefined {
  const invalid = priceError(value, false, labels);
  if (invalid !== undefined || value === null || value.trim() === "" || entry === undefined) {
    return invalid;
  }
  const wantsAbove = (kind === "takeProfit") === (side === "long");
  const comparison = compareDecimal(value, entry);
  if (wantsAbove && comparison <= 0) {
    return kind === "takeProfit" ? labels.errorTakeProfitAbove : labels.errorStopLossAbove;
  }
  if (!wantsAbove && comparison >= 0) {
    return kind === "takeProfit" ? labels.errorTakeProfitBelow : labels.errorStopLossBelow;
  }
  return undefined;
}

/** Validates the ticket; an empty object means it can be submitted. */
export function validateTicket(state: TicketState, ctx: ValidationContext): TicketErrors {
  const { market, labels } = ctx;
  const entry = entryPrice(state, ctx.referencePrice);
  const errors: TicketErrors = {
    price: needsPrice(state.type) ? priceError(state.price, true, labels) : undefined,
    triggerPrice: needsTrigger(state.type)
      ? priceError(state.triggerPrice, true, labels)
      : undefined,
    size: sizeError(state, ctx),
    leverage: validLeverage(state.leverage, market)
      ? undefined
      : labels.errorLeverage(market.maxLeverage),
    takeProfit: exitError("takeProfit", state.takeProfit, state.side, entry, labels),
    stopLoss: exitError("stopLoss", state.stopLoss, state.side, entry, labels),
  };
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== undefined),
  ) as TicketErrors;
}

export function hasErrors(errors: TicketErrors): boolean {
  return Object.keys(errors).length > 0;
}
