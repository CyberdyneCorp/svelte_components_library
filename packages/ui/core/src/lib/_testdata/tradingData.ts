/** Deterministic market data for the Trading stories. */
import type { Candle, MarketSpec } from "../trading/types.js";

export const BTC_PERP: MarketSpec = {
  symbol: "BTC-PERP",
  baseAsset: "BTC",
  quoteAsset: "USDT",
  tickSize: "0.5",
  stepSize: "0.001",
  minSize: "0.001",
  maxLeverage: 100,
};

export const HOUR = 3_600_000;

/** Seeded PRNG (Park–Miller). */
export function seeded(seed = 7): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** A multiplicative random walk around `base`, one bar per `interval`, ending at `end`. */
export function marketCandles(
  count: number,
  { base = 64_000, interval = HOUR, end = Date.UTC(2026, 8, 1), seed = 7, volatility = 0.006 } = {},
): Candle[] {
  const random = seeded(seed);
  const start = end - (count - 1) * interval;
  const candles: Candle[] = new Array(count);
  let price = base;
  for (let i = 0; i < count; i++) {
    const open = price;
    const drift = Math.sin(i / 180) * volatility * 0.15;
    const close = open * (1 + drift + (random() - 0.5) * volatility);
    const high = Math.max(open, close) * (1 + random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - random() * volatility * 0.5);
    const volume = Math.round(50 + random() * 400 + Math.abs(close - open) * 0.5);
    candles[i] = { time: start + i * interval, open, high, low, close, volume };
    price = close;
  }
  return candles;
}

/** The next live tick: revises the last bar, or opens a new one every `ticksPerBar` ticks. */
export function nextTick(candles: Candle[], tick: number, random: () => number, ticksPerBar = 10, interval = HOUR): Candle[] {
  const last = candles[candles.length - 1];
  const price = last.close * (1 + (random() - 0.5) * 0.002);
  if (tick % ticksPerBar === 0) {
    const bar = { time: last.time + interval, open: last.close, high: Math.max(last.close, price), low: Math.min(last.close, price), close: price, volume: 5 };
    return [...candles, bar];
  }
  const updated = {
    ...last,
    high: Math.max(last.high, price),
    low: Math.min(last.low, price),
    close: price,
    volume: (last.volume ?? 0) + Math.round(random() * 20),
  };
  return [...candles.slice(0, -1), updated];
}
