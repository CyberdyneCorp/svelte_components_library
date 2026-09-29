/**
 * Simulated futures account for the Trading/Terminal story: fills orders
 * against the simulated feed, keeps hedge-mode positions (one per side) and
 * derives the chart's markers and price lines. Demo maths only — real
 * margin, fee and liquidation rules are exchange-specific.
 */
import {
  addDecimal,
  compareDecimal,
  divideDecimal,
  multiplyDecimal,
  signOf,
  subtractDecimal,
  trimDecimal,
} from "../trading/decimal.js";
import { precisionOf, roundToTick } from "../trading/format.js";
import type {
  Candle,
  ChartMarker,
  MarginMode,
  MarketSpec,
  OpenOrder,
  OrderDraft,
  Position,
  PriceLine,
  Side,
} from "../trading/types.js";

/** What a resting order needs when it fills (the `OpenOrder` row does not carry it). */
interface Intent {
  leverage: number;
  marginMode: MarginMode;
  takeProfit?: string;
  stopLoss?: string;
}

type FillRequest = Intent & { side: Side; size: string; reduceOnly: boolean };

export interface Fill {
  id: string;
  side: Side;
  price: string;
  size: string;
  time: number;
}

export interface Account {
  market: MarketSpec;
  positions: Position[];
  orders: OpenOrder[];
  fills: Fill[];
  intents: Record<string, Intent>;
  seq: number;
}

export const opposite = (side: Side): Side => (side === "long" ? "short" : "long");

const minDecimal = (a: string, b: string) => (compareDecimal(a, b) <= 0 ? a : b);

/** A float chart price as a tick-aligned decimal string. */
export function tickPrice(price: number, market: MarketSpec): string {
  return roundToTick(price.toFixed(precisionOf(market.tickSize) + 2), market.tickSize);
}

/** Demo liquidation: entry × (1 ∓ 1/leverage), to the tick. */
export function demoLiquidation(side: Side, entry: string, leverage: number, market: MarketSpec): string {
  const move = divideDecimal(entry, String(leverage), 8);
  const price = side === "long" ? subtractDecimal(entry, move) : addDecimal(entry, move);
  return roundToTick(price, market.tickSize);
}

function marginOf(entry: string, size: string, leverage: number): string {
  return divideDecimal(multiplyDecimal(entry, size), String(leverage), 2, "up");
}

/** Recomputes margin, liquidation, PnL and ROE (a percentage) after a size or mark change. */
function revalue(position: Position, market: MarketSpec): Position {
  const { side, entryPrice, size, leverage, markPrice } = position;
  const margin = marginOf(entryPrice, size, leverage);
  const move = side === "long" ? subtractDecimal(markPrice, entryPrice) : subtractDecimal(entryPrice, markPrice);
  const pnl = multiplyDecimal(move, size);
  const roe = signOf(margin) > 0 ? divideDecimal(multiplyDecimal(pnl, "100"), margin, 2, "nearest") : undefined;
  return {
    ...position,
    margin,
    unrealizedPnl: trimDecimal(pnl),
    roe,
    liquidationPrice: demoLiquidation(side, entryPrice, leverage, market),
  };
}

function withFill(account: Account, side: Side, size: string, price: string, time: number): Account {
  const fill = { id: `f${account.seq}`, side, price, size, time };
  return { ...account, fills: [...account.fills, fill], seq: account.seq + 1 };
}

function reduce(account: Account, request: FillRequest, price: string, time: number): Account {
  const target = account.positions.find((p) => p.side === opposite(request.side));
  if (!target) return account;
  const size = minDecimal(request.size, target.size);
  const rest = subtractDecimal(target.size, size);
  const positions =
    signOf(rest) > 0
      ? account.positions.map((p) => (p === target ? revalue({ ...p, size: rest }, account.market) : p))
      : account.positions.filter((p) => p !== target);
  return withFill({ ...account, positions }, request.side, size, price, time);
}

function increase(account: Account, request: FillRequest, price: string, time: number): Account {
  const existing = account.positions.find((p) => p.side === request.side);
  let positions: Position[];
  if (existing) {
    const size = addDecimal(existing.size, request.size);
    const cost = addDecimal(multiplyDecimal(existing.entryPrice, existing.size), multiplyDecimal(price, request.size));
    const entryPrice = roundToTick(divideDecimal(cost, size, 8), account.market.tickSize);
    const next = revalue({ ...existing, size, entryPrice }, account.market);
    positions = account.positions.map((p) => (p === existing ? next : p));
  } else {
    const opened: Position = {
      id: `p${account.seq}`,
      market: account.market.symbol,
      side: request.side,
      size: request.size,
      entryPrice: price,
      markPrice: price,
      margin: "0",
      leverage: request.leverage,
      marginMode: request.marginMode,
      unrealizedPnl: "0",
      takeProfit: request.takeProfit,
      stopLoss: request.stopLoss,
    };
    positions = [...account.positions, revalue(opened, account.market)];
  }
  return withFill({ ...account, positions, seq: account.seq + 1 }, request.side, request.size, price, time);
}

/** Fills `request` at `price`: reduce-only orders shrink the opposite position, others grow their side. */
export function applyFill(account: Account, request: FillRequest, price: string, time: number): Account {
  return request.reduceOnly ? reduce(account, request, price, time) : increase(account, request, price, time);
}

/** True when a limit price can trade now against `last`. */
export function marketable(side: Side, price: string, last: string): boolean {
  return side === "long" ? compareDecimal(price, last) >= 0 : compareDecimal(price, last) <= 0;
}

type OrderTerms = Pick<OpenOrder, "type" | "side" | "price" | "triggerPrice">;

function triggered(order: OrderTerms, last: string): boolean {
  if (!order.triggerPrice) return true;
  return order.side === "long" ? compareDecimal(last, order.triggerPrice) >= 0 : compareDecimal(last, order.triggerPrice) <= 0;
}

/** The price a new order fills at now, or undefined when it has to rest. */
function fillPrice(order: OrderTerms, last: string): string | undefined {
  if (!triggered(order, last)) return undefined;
  if (order.type === "market" || order.type === "stop-market") return last;
  return order.price && marketable(order.side, order.price, last) ? last : undefined;
}

/** A resting limit order fills at its own price once `last` reaches it. */
function restingFillPrice(order: OrderTerms, last: string): string | undefined {
  if (order.type !== "limit") return fillPrice(order, last);
  return order.price && marketable(order.side, order.price, last) ? order.price : undefined;
}

/** Places a ticket draft: market and marketable limit orders fill at `last`, the rest rest. */
export function submitOrder(account: Account, draft: OrderDraft, last: string, time: number): Account {
  const intent: Intent = {
    leverage: draft.leverage,
    marginMode: draft.marginMode,
    takeProfit: draft.takeProfit,
    stopLoss: draft.stopLoss,
  };
  const order: OpenOrder = {
    id: `o${account.seq}`,
    market: draft.market,
    side: draft.side,
    type: draft.type,
    size: draft.size,
    filled: "0",
    price: draft.price,
    triggerPrice: draft.triggerPrice,
    reduceOnly: draft.reduceOnly,
    timeInForce: draft.timeInForce,
    createdAt: time,
  };
  const price = draft.postOnly ? undefined : fillPrice(order, last);
  const next = { ...account, seq: account.seq + 1 };
  if (price !== undefined) return applyFill(next, { ...intent, side: draft.side, size: draft.size, reduceOnly: draft.reduceOnly }, price, time);
  return { ...next, orders: [...account.orders, order], intents: { ...account.intents, [order.id]: intent } };
}

/** One feed step: fills resting orders that `last` reached and marks positions to `mark`. */
export function tickAccount(account: Account, last: string, mark: string, time: number): Account {
  let next = account;
  for (const order of account.orders) {
    const price = restingFillPrice(order, last);
    if (price === undefined) continue;
    const intent = account.intents[order.id] ?? { leverage: 10, marginMode: "cross" };
    next = applyFill(next, { ...intent, side: order.side, size: order.size, reduceOnly: order.reduceOnly }, price, time);
    next = cancelOrder(next, order.id);
  }
  return { ...next, positions: next.positions.map((p) => revalue({ ...p, markPrice: mark }, next.market)) };
}

export function cancelOrder(account: Account, id: string): Account {
  const intents = { ...account.intents };
  delete intents[id];
  return { ...account, orders: account.orders.filter((o) => o.id !== id), intents };
}

/** Closes a position: at `last` for a market close, or as a reduce-only limit order at `mark`. */
export function closePosition(account: Account, position: Position, kind: "market" | "limit", last: string, mark: string, time: number): Account {
  const draft: OrderDraft = {
    market: position.market,
    side: opposite(position.side),
    type: kind,
    size: position.size,
    sizeUnit: "base",
    price: kind === "limit" ? mark : undefined,
    leverage: position.leverage,
    marginMode: position.marginMode,
    reduceOnly: true,
    postOnly: false,
    timeInForce: "GTC",
  };
  return submitOrder(account, draft, last, time);
}

const LINE_FIELDS = { tp: "takeProfit", sl: "stopLoss" } as const;

/** Applies a dragged (or keyboard-moved) TP / SL line: ids are `<position id>:tp|sl`. */
export function moveProtection(account: Account, lineId: string, price: number): Account {
  const [positionId, key] = lineId.split(":");
  const field = LINE_FIELDS[key as keyof typeof LINE_FIELDS];
  if (!field) return account;
  const value = tickPrice(price, account.market);
  const positions = account.positions.map((p) => (p.id === positionId ? { ...p, [field]: value } : p));
  return { ...account, positions };
}

/** Entry, TP, SL and liquidation lines of every open position (TP / SL draggable). */
export function positionLines(positions: readonly Position[], sideNames: Record<Side, string>): PriceLine[] {
  const tagged = positions.length > 1;
  return positions.flatMap((p) => {
    const suffix = tagged ? ` ${sideNames[p.side]}` : "";
    const line = (key: string, price: string | undefined, kind: PriceLine["kind"], tag: string, draggable = false): PriceLine[] =>
      price === undefined ? [] : [{ id: `${p.id}:${key}`, price: Number(price), kind, draggable, label: tag + suffix }];
    return [
      ...line("entry", p.entryPrice, "entry", "Entry"),
      ...line("tp", p.takeProfit, "take-profit", "TP", true),
      ...line("sl", p.stopLoss, "stop-loss", "SL", true),
      ...line("liq", p.liquidationPrice, "liquidation", "Liq."),
    ];
  });
}

/** Buy / sell arrows at the bars where fills happened. */
export function fillMarkers(fills: readonly Fill[]): ChartMarker[] {
  return fills.map((fill) => ({
    id: fill.id,
    time: fill.time,
    position: fill.side === "long" ? "below" : "above",
    shape: fill.side === "long" ? "arrow-up" : "arrow-down",
    text: fill.side === "long" ? "Buy" : "Sell",
  }));
}

/** Available margin: `balance` minus the margin of open positions, never below zero. */
export function availableMargin(balance: string, positions: readonly Position[]): string {
  const used = positions.reduce((sum, p) => addDecimal(sum, p.margin), "0");
  const free = subtractDecimal(balance, used);
  return signOf(free) > 0 ? free : "0";
}

/** Revises the last bar with `price`, or opens a new bar once `now` passes the bar interval. */
export function tickCandles(candles: readonly Candle[], price: number, volume: number, now: number, interval: number): Candle[] {
  const last = candles[candles.length - 1];
  if (now >= last.time + interval) {
    const time = last.time + interval * Math.floor((now - last.time) / interval);
    const bar = { time, open: last.close, high: Math.max(last.close, price), low: Math.min(last.close, price), close: price, volume };
    return [...candles, bar];
  }
  const revised = {
    ...last,
    high: Math.max(last.high, price),
    low: Math.min(last.low, price),
    close: price,
    volume: (last.volume ?? 0) + volume,
  };
  return [...candles.slice(0, -1), revised];
}

/** Scales a candle history so its last close equals `last` (joins the chart to the feed). */
export function alignCandles(candles: readonly Candle[], last: number): Candle[] {
  const factor = last / candles[candles.length - 1].close;
  return candles.map((c) => ({ ...c, open: c.open * factor, high: c.high * factor, low: c.low * factor, close: c.close * factor }));
}

/** Starting account: one closed round trip, an open long with TP / SL, and a resting limit bid. */
export function seedAccount(market: MarketSpec, candles: readonly Candle[], last: string, now: number): Account {
  let account: Account = { market, positions: [], orders: [], fills: [], intents: {}, seq: 1 };
  const at = (index: number) => tickPrice(candles[index].close, market);
  const intent = { leverage: 10, marginMode: "cross" as const };
  const n = candles.length;
  account = applyFill(account, { ...intent, side: "long", size: "0.2", reduceOnly: false }, at(n - 120), candles[n - 120].time);
  account = applyFill(account, { ...intent, side: "short", size: "0.2", reduceOnly: true }, at(n - 90), candles[n - 90].time);
  const entry = at(n - 40);
  const bracket = {
    ...intent,
    takeProfit: roundToTick(multiplyDecimal(entry, "1.006"), market.tickSize),
    stopLoss: roundToTick(multiplyDecimal(entry, "0.995"), market.tickSize),
  };
  account = applyFill(account, { ...bracket, side: "long", size: "0.25", reduceOnly: false }, entry, candles[n - 40].time);
  const bid = roundToTick(multiplyDecimal(last, "0.997"), market.tickSize);
  const draft: OrderDraft = {
    market: market.symbol,
    side: "long",
    type: "limit",
    size: "0.1",
    sizeUnit: "base",
    price: bid,
    leverage: 10,
    marginMode: "cross",
    reduceOnly: false,
    postOnly: false,
    timeInForce: "GTC",
  };
  return tickAccount(submitOrder(account, draft, last, now), last, last, now);
}
