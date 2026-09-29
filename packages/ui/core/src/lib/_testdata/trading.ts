/** Shared test fixtures for the order-entry tests and stories. */
import type { MarketSpec, OpenOrder, Position } from "../trading/types.js";
import type { TicketState } from "../trading/order/ticket.js";

export const BTC_USDT: MarketSpec = {
  symbol: "BTC-USDT",
  baseAsset: "BTC",
  quoteAsset: "USDT",
  tickSize: "0.5",
  stepSize: "0.001",
  minSize: "0.001",
  maxSize: "100",
  minNotional: "5",
  maxLeverage: 50,
};

export const ETH_USDT: MarketSpec = {
  symbol: "ETH-USDT",
  baseAsset: "ETH",
  quoteAsset: "USDT",
  tickSize: "0.01",
  stepSize: "0.01",
  minSize: "0.01",
  maxLeverage: 25,
};

export const MARKETS: Record<string, MarketSpec> = {
  [BTC_USDT.symbol]: BTC_USDT,
  [ETH_USDT.symbol]: ETH_USDT,
};

export function ticketState(overrides: Partial<TicketState> = {}): TicketState {
  return {
    side: "long",
    type: "limit",
    price: "64000.0",
    triggerPrice: null,
    size: "0.010",
    sizeUnit: "base",
    leverage: 10,
    marginMode: "cross",
    reduceOnly: false,
    postOnly: false,
    timeInForce: "GTC",
    takeProfit: null,
    stopLoss: null,
    ...overrides,
  };
}

export const POSITIONS: Position[] = [
  {
    id: "p1",
    market: "BTC-USDT",
    side: "long",
    size: "0.25",
    entryPrice: "63250.5",
    markPrice: "64120",
    liquidationPrice: "57100",
    margin: "1581.26",
    leverage: 10,
    marginMode: "cross",
    unrealizedPnl: "217.375",
    roe: "13.75",
    takeProfit: "68000",
    stopLoss: "61000",
  },
  {
    id: "p2",
    market: "ETH-USDT",
    side: "short",
    size: "3.5",
    entryPrice: "3120.4",
    markPrice: "3188.15",
    margin: "1092.14",
    leverage: 10,
    marginMode: "isolated",
    unrealizedPnl: "-237.125",
    roe: "-21.71",
  },
];

export const ORDERS: OpenOrder[] = [
  {
    id: "o1",
    market: "BTC-USDT",
    side: "long",
    type: "limit",
    size: "0.1",
    filled: "0.025",
    price: "62000",
    reduceOnly: false,
    timeInForce: "GTC",
    createdAt: Date.UTC(2026, 8, 29, 12, 30, 0),
  },
  {
    id: "o2",
    market: "ETH-USDT",
    side: "short",
    type: "stop-market",
    size: "1.5",
    filled: "0",
    triggerPrice: "3250",
    reduceOnly: true,
    timeInForce: "GTC",
    createdAt: Date.UTC(2026, 8, 29, 13, 5, 0),
  },
];
