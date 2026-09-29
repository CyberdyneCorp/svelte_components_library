/**
 * Shared trading contracts (OpenSpec add-trading-suite, design D2 / D5).
 *
 * Chart data (`Candle`, `ChartMarker`, `PriceLine`) uses `number`, because the
 * chart and indicators run on thousands of values per frame. Everything that
 * reaches an order, position or book uses decimal strings ("64123.5"), so
 * prices and sizes are shown and edited exactly and never carry float noise.
 */

export type Side = "long" | "short";
export type OrderType = "market" | "limit" | "stop-market" | "stop-limit";
export type TimeInForce = "GTC" | "IOC" | "FOK";
export type MarginMode = "cross" | "isolated";

/** One OHLCV bar. `time` is the bar open in UTC milliseconds. */
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/** Static market rules. Precisions are derived from `tickSize` / `stepSize` when omitted. */
export interface MarketSpec {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  tickSize: string;
  stepSize: string;
  minSize: string;
  maxSize?: string;
  minNotional?: string;
  maxLeverage: number;
  pricePrecision?: number;
  sizePrecision?: number;
}

export interface OrderDraft {
  market: string;
  side: Side;
  type: OrderType;
  size: string;
  sizeUnit: "base" | "quote";
  price?: string;
  triggerPrice?: string;
  leverage: number;
  marginMode: MarginMode;
  reduceOnly: boolean;
  postOnly: boolean;
  timeInForce: TimeInForce;
  takeProfit?: string;
  stopLoss?: string;
}

export interface Position {
  id: string;
  market: string;
  side: Side;
  size: string;
  entryPrice: string;
  markPrice: string;
  liquidationPrice?: string;
  margin: string;
  leverage: number;
  marginMode: MarginMode;
  unrealizedPnl: string;
  roe?: string;
  takeProfit?: string;
  stopLoss?: string;
}

export interface OpenOrder {
  id: string;
  market: string;
  side: Side;
  type: OrderType;
  size: string;
  filled: string;
  price?: string;
  triggerPrice?: string;
  reduceOnly: boolean;
  timeInForce: TimeInForce;
  createdAt: number;
}

export interface BookLevel {
  price: string;
  size: string;
}

export interface Trade {
  id: string;
  price: string;
  size: string;
  side: "buy" | "sell";
  time: number;
}

export interface Ticker {
  market: string;
  last: string;
  mark?: string;
  index?: string;
  change24h?: string;
  changePct24h?: string;
  high24h?: string;
  low24h?: string;
  volume24h?: string;
  quoteVolume24h?: string;
  openInterest?: string;
  fundingRate?: string;
  nextFundingTime?: number;
}

/** A marker drawn on a bar (entry / exit arrows and the like). */
export interface ChartMarker {
  time: number;
  position: "above" | "below" | "at";
  shape: "arrow-up" | "arrow-down" | "circle" | "square";
  color?: string;
  text?: string;
  id?: string;
}

/** A horizontal price line (entry, TP, SL, liquidation or custom). */
export interface PriceLine {
  price: number;
  kind?: "entry" | "take-profit" | "stop-loss" | "liquidation" | "custom";
  label?: string;
  color?: string;
  style?: "solid" | "dashed" | "dotted";
  draggable?: boolean;
  id?: string;
}
