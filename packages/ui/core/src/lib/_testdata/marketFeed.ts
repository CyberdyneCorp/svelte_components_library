/**
 * Deterministic simulated perpetual-futures feed for the Trading/* stories:
 * an order book, a trade tape and a ticker that drift together.
 */
import type { BookLevel, MarketSpec, Ticker, Trade } from "../trading/types.js";

export const demoMarket: MarketSpec = {
  symbol: "BTC-PERP",
  baseAsset: "BTC",
  quoteAsset: "USDT",
  tickSize: "0.5",
  stepSize: "0.001",
  minSize: "0.001",
  maxLeverage: 100,
};

export interface MarketSnapshot {
  bids: BookLevel[];
  asks: BookLevel[];
  trades: Trade[];
  ticker: Ticker;
}

/** Small seeded PRNG (mulberry32) so stories render the same data every run. */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TICK = 0.5;
const OPEN_24H = 63000;
const FUNDING_PERIOD = 8 * 3600_000;

const toTick = (price: number) => (Math.round(price / TICK) * TICK).toFixed(1);
const toSize = (size: number) => Math.max(0.001, size).toFixed(3);

function side(mid: number, levels: number, direction: 1 | -1, rand: () => number): BookLevel[] {
  const best = direction === 1 ? Math.ceil((mid + 0.1) / TICK) * TICK : Math.floor((mid - 0.1) / TICK) * TICK;
  return Array.from({ length: levels }, (_, i) => ({
    price: toTick(best + direction * i * TICK),
    size: toSize(rand() * (0.2 + i * 0.15)),
  }));
}

/** Creates a feed; each `next()` returns a fresh snapshot one step later. */
export function createMarketFeed(options: { seed?: number; levels?: number; start?: number } = {}) {
  const rand = random(options.seed ?? 42);
  const levels = options.levels ?? 40;
  let now = options.start ?? Date.UTC(2026, 8, 29, 7, 55, 0);
  let mid = 64123.25;
  let high = 64510;
  let low = 62810.5;
  let tradeId = 0;
  let trades: Trade[] = [];

  function trade(): Trade {
    const buy = rand() > 0.5;
    now += Math.floor(rand() * 400);
    return {
      id: `t${++tradeId}`,
      price: toTick(buy ? mid + TICK / 2 : mid - TICK / 2),
      size: toSize(rand() * 0.8),
      side: buy ? "buy" : "sell",
      time: now,
    };
  }

  function snapshot(): MarketSnapshot {
    const last = toTick(mid);
    const change = Number(last) - OPEN_24H;
    return {
      bids: side(mid, levels, -1, rand),
      asks: side(mid, levels, 1, rand),
      trades,
      ticker: {
        market: demoMarket.symbol,
        last,
        mark: toTick(mid + 1.5),
        index: toTick(mid - 2),
        change24h: change.toFixed(1),
        changePct24h: ((change / OPEN_24H) * 100).toFixed(4),
        high24h: toTick(high),
        low24h: toTick(low),
        volume24h: (12345.678 + tradeId * 0.4).toFixed(3),
        quoteVolume24h: (790_123_456 + tradeId * 25_000).toFixed(2),
        openInterest: "8123.456",
        fundingRate: "0.000125",
        nextFundingTime: Math.ceil((now + 1) / FUNDING_PERIOD) * FUNDING_PERIOD,
      },
    };
  }

  /** Advances the market: moves the mid price and prints 1–3 trades. */
  function next(): MarketSnapshot {
    mid += (rand() - 0.5) * 6;
    high = Math.max(high, mid);
    low = Math.min(low, mid);
    const printed = Array.from({ length: 1 + Math.floor(rand() * 3) }, trade).reverse();
    trades = [...printed, ...trades].slice(0, 500);
    return snapshot();
  }

  for (let i = 0; i < 60; i++) next();
  return { next, current: snapshot };
}
