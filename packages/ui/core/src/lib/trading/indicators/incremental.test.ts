import { describe, it, expect } from "vitest";
import type { Candle } from "../types.js";
import {
  adx,
  atr,
  bollinger,
  createADX,
  createATR,
  createBollinger,
  createEMA,
  createMACD,
  createRSI,
  createSMA,
  createStochastic,
  createVWAP,
  createWMA,
  ema,
  macd,
  rsi,
  sma,
  stochastic,
  vwap,
  wma,
  type IndicatorCalculator,
} from "./index.js";
import {
  mulberry32,
  naiveBollinger,
  naiveSma,
  naiveWma,
  randomCandles,
} from "../../_testdata/naive-indicators.js";

/** Per-bar rows from a batch result (a plain series, or an object of aligned series). */
function rowsOf(result: unknown): unknown[] {
  if (Array.isArray(result)) return result;
  const cols = result as Record<string, unknown[]>;
  const keys = Object.keys(cols);
  return cols[keys[0]].map((_, i) => Object.fromEntries(keys.map((k) => [k, cols[k][i]])));
}

/** A same-bar revision: the forming candle before it settles on `final`. */
function tick(final: Candle, rand: () => number): Candle {
  const close = final.close * (1 + (rand() - 0.5) * 0.02);
  return {
    ...final,
    high: Math.max(final.high, close),
    low: Math.min(final.low, close),
    close,
    volume: rand() < 0.2 ? undefined : Math.round(rand() * 500),
  };
}

interface Case<I> {
  name: string;
  batch: (candles: Candle[]) => unknown;
  create: () => IndicatorCalculator<I, unknown>;
  input: (candle: Candle) => I;
}

const close = (c: Candle) => c.close;
const whole = (c: Candle) => c;

const CASES: Case<any>[] = [
  { name: "sma(9)", batch: (c) => sma(c.map(close), 9), create: () => createSMA(9), input: close },
  { name: "sma(1)", batch: (c) => sma(c.map(close), 1), create: () => createSMA(1), input: close },
  {
    name: "ema(21)",
    batch: (c) => ema(c.map(close), 21),
    create: () => createEMA(21),
    input: close,
  },
  {
    name: "wma(10)",
    batch: (c) => wma(c.map(close), 10),
    create: () => createWMA(10),
    input: close,
  },
  { name: "rsi(14)", batch: (c) => rsi(c.map(close)), create: () => createRSI(), input: close },
  { name: "rsi(2)", batch: (c) => rsi(c.map(close), 2), create: () => createRSI(2), input: close },
  {
    name: "bollinger(20, 2)",
    batch: (c) => bollinger(c.map(close)),
    create: () => createBollinger(),
    input: close,
  },
  { name: "atr(14)", batch: (c) => atr(c), create: () => createATR(), input: whole },
  { name: "adx(14)", batch: (c) => adx(c), create: () => createADX(), input: whole },
  { name: "adx(3)", batch: (c) => adx(c, 3), create: () => createADX(3), input: whole },
  {
    name: "macd(12, 26, 9)",
    batch: (c) => macd(c.map(close)),
    create: () => createMACD(),
    input: close,
  },
  {
    name: "stochastic(14, 1, 3)",
    batch: (c) => stochastic(c),
    create: () => createStochastic(),
    input: whole,
  },
  {
    name: "stochastic(5, 3, 3)",
    batch: (c) => stochastic(c, { kPeriod: 5, smoothK: 3 }),
    create: () => createStochastic({ kPeriod: 5, smoothK: 3 }),
    input: whole,
  },
  { name: "vwap(day)", batch: (c) => vwap(c), create: () => createVWAP(), input: whole },
  {
    name: "vwap(none)",
    batch: (c) => vwap(c, { session: "none" }),
    create: () => createVWAP({ session: "none" }),
    input: whole,
  },
];

describe("spec scenario: batch and incremental agree", () => {
  describe.each(CASES)("$name", ({ batch, create, input }) => {
    it.each([1, 2, 3])("with update revisions (seed %i)", (seed) => {
      const candles = randomCandles(250, seed, seed === 2 ? 64_000 : 100);
      const expected = rowsOf(batch(candles));
      const rand = mulberry32(seed * 101);
      const calc = create();
      const actual = candles.map((final) => {
        // Each bar opens with `next`, may be revised with `update` several times
        // (including values that stray outside the final bar), then settles.
        const revisions = Math.floor(rand() * 4);
        if (revisions === 0) return calc.next(input(final));
        calc.next(input(tick(final, rand)));
        for (let r = 1; r < revisions; r++) calc.update(input(tick(final, rand)));
        return calc.update(input(final));
      });
      expect(actual).toEqual(expected);
    });

    it("update before the first next behaves like next", () => {
      const candles = randomCandles(40, 9);
      const expected = rowsOf(batch(candles));
      const calc = create();
      const actual = candles.map((c, i) => (i === 0 ? calc.update(input(c)) : calc.next(input(c))));
      expect(actual).toEqual(expected);
    });
  });
});

describe("numerical stability of the rolling windows", () => {
  // 20k bars around 64 000 with tiny moves: the regime where Σx² − (Σx)²/n
  // cancels catastrophically and running sums drift.
  const rand = mulberry32(42);
  let price = 64_000;
  const closes = Array.from({ length: 20_000 }, () => (price += (rand() - 0.5) * 0.5));
  const samples = [19, 999, 5_000, 12_345, 19_999];

  it("SMA / WMA stay within 1e-9 relative of a fresh recomputation", () => {
    const s = sma(closes, 20);
    const w = wma(closes, 20);
    const ns = naiveSma(closes, 20);
    const nw = naiveWma(closes, 20);
    for (const i of samples) {
      expect(Math.abs(s[i]! - ns[i]!) / ns[i]!).toBeLessThan(1e-12);
      expect(Math.abs(w[i]! - nw[i]!) / nw[i]!).toBeLessThan(1e-12);
    }
  });

  it("Bollinger band width stays accurate (Welford-style M2, periodic rebuild)", () => {
    const got = bollinger(closes);
    const want = naiveBollinger(closes, 20, 2);
    for (const i of samples) {
      const width = want.upper[i]! - want.middle[i]!;
      expect(Math.abs(got.upper[i]! - got.middle[i]! - width) / width).toBeLessThan(1e-6);
    }
  });
});
