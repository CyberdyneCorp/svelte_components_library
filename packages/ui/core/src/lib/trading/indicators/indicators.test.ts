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
  trueRange,
  vwap,
  wma,
} from "./index.js";
import {
  ADX_14,
  ADX_HLC,
  ADX_MINUS_DI_14,
  ADX_PLUS_DI_14,
  ATR_14,
  ATR_HLC,
  RSI_14,
  RSI_CLOSES,
} from "../../_testdata/stockcharts-indicators.js";
import {
  naiveAdx,
  naiveAtr,
  naiveBollinger,
  naiveEma,
  naiveMacd,
  naiveRsi,
  naiveSma,
  naiveStochastic,
  naiveVwap,
  naiveWma,
  randomCandles,
} from "../../_testdata/naive-indicators.js";

type Series = (number | null)[];

/** Same warm-up nulls, and |actual − expected| ≤ rel · |expected| + abs at every index. */
function expectSeriesClose(actual: Series, expected: Series, rel: number, abs = 0): void {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((a, i) => {
    const e = expected[i];
    if (e === null || a === null) {
      expect({ i, a }).toEqual({ i, a: e });
      return;
    }
    const tolerance = rel * Math.abs(e) + abs;
    if (Math.abs(a - e) > tolerance) {
      expect.fail(`index ${i}: ${a} differs from ${e} by more than ${tolerance}`);
    }
  });
}

const toCandles = (rows: [number, number, number][]): Candle[] =>
  rows.map(([high, low, close], i) => ({ time: i * 86_400_000, open: close, high, low, close }));

const closesOf = (candles: Candle[]) => candles.map((c) => c.close);
const nulls = (n: number) => new Array<null>(n).fill(null);

describe("spec scenario: output is aligned with warm-up nulls", () => {
  it("sma(30 closes, 10) has length 30, nulls at 0–8 and the mean of the first 10 at 9", () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 + ((i * 7) % 11));
    const result = sma(closes, 10);
    expect(result).toHaveLength(30);
    expect(result.slice(0, 9)).toEqual(nulls(9));
    expect(result[9]).toBeCloseTo(closes.slice(0, 10).reduce((a, b) => a + b) / 10, 12);
  });
});

describe("spec scenario: published reference values (StockCharts, within 1e-6 relative)", () => {
  it("rsi(closes, 14) matches cs-rsi.xls", () => {
    expectSeriesClose(rsi(RSI_CLOSES, 14), RSI_14, 1e-6);
  });

  it("atr(candles, 14) matches cs-atr.xls", () => {
    expectSeriesClose(atr(toCandles(ATR_HLC), 14), ATR_14, 1e-6);
  });

  it("adx(candles, 14) matches cs-adx.xls (ADX, +DI, −DI)", () => {
    const result = adx(toCandles(ADX_HLC), 14);
    expectSeriesClose(result.adx, ADX_14, 1e-6);
    expectSeriesClose(result.plusDI, ADX_PLUS_DI_14, 1e-6);
    expectSeriesClose(result.minusDI, ADX_MINUS_DI_14, 1e-6);
  });
});

describe("agreement with independent naive implementations", () => {
  // Two scales: a BTC-like price (float cancellation) and a sub-cent token.
  for (const start of [64_000, 0.0123]) {
    const candles = randomCandles(400, 7, start);
    const closes = closesOf(candles);
    const abs = 1e-9 * start;

    describe(`random walk around ${start}`, () => {
      it.each([1, 2, 5, 20])("sma / ema / wma, period %i", (p) => {
        expectSeriesClose(sma(closes, p), naiveSma(closes, p), 1e-9, abs);
        expectSeriesClose(ema(closes, p), naiveEma(closes, p), 1e-9, abs);
        expectSeriesClose(wma(closes, p), naiveWma(closes, p), 1e-9, abs);
      });

      it.each([1, 2, 14])("rsi / atr / adx, period %i", (p) => {
        expectSeriesClose(rsi(closes, p), naiveRsi(closes, p), 1e-9, 1e-9);
        expectSeriesClose(atr(candles, p), naiveAtr(candles, p), 1e-9, abs);
        const got = adx(candles, p);
        const want = naiveAdx(candles, p);
        expectSeriesClose(got.plusDI, want.plusDI, 1e-9, 1e-9);
        expectSeriesClose(got.minusDI, want.minusDI, 1e-9, 1e-9);
        expectSeriesClose(got.adx, want.adx, 1e-9, 1e-9);
      });

      it("bollinger (20, 2) and (5, 1.5)", () => {
        for (const [period, stdDev] of [
          [20, 2],
          [5, 1.5],
        ]) {
          const got = bollinger(closes, { period, stdDev });
          const want = naiveBollinger(closes, period, stdDev);
          expectSeriesClose(got.middle, want.middle, 1e-9, abs);
          expectSeriesClose(got.upper, want.upper, 1e-9, abs);
          expectSeriesClose(got.lower, want.lower, 1e-9, abs);
        }
      });

      it("macd (12, 26, 9) and (3, 5, 2)", () => {
        for (const [fastPeriod, slowPeriod, signalPeriod] of [
          [12, 26, 9],
          [3, 5, 2],
        ]) {
          const got = macd(closes, { fastPeriod, slowPeriod, signalPeriod });
          const want = naiveMacd(closes, fastPeriod, slowPeriod, signalPeriod);
          expectSeriesClose(got.macd, want.macd, 1e-9, abs);
          expectSeriesClose(got.signal, want.signal, 1e-9, abs);
          expectSeriesClose(got.histogram, want.histogram, 1e-9, abs);
        }
      });

      it.each([
        [14, 1, 3],
        [14, 3, 3],
        [5, 2, 4],
        [1, 1, 1],
      ])("stochastic (%i, %i, %i)", (kPeriod, smoothK, dPeriod) => {
        const got = stochastic(candles, { kPeriod, smoothK, dPeriod });
        const want = naiveStochastic(candles, kPeriod, smoothK, dPeriod);
        expectSeriesClose(got.k, want.k, 1e-9, 1e-9);
        expectSeriesClose(got.d, want.d, 1e-9, 1e-9);
      });

      it("vwap per UTC day, anchored, and per custom session", () => {
        const day = (t: number) => Math.floor(t / 86_400_000);
        const sixHours = (t: number) => Math.floor(t / 21_600_000);
        expectSeriesClose(vwap(candles), naiveVwap(candles, day), 1e-9, abs);
        expectSeriesClose(
          vwap(candles, { session: "none" }),
          naiveVwap(candles, () => 0),
          1e-9,
          abs,
        );
        expectSeriesClose(
          vwap(candles, { session: sixHours }),
          naiveVwap(candles, sixHours),
          1e-9,
          abs,
        );
      });
    });
  }
});

describe("warm-up positions", () => {
  const candles = randomCandles(60, 3);
  const closes = closesOf(candles);
  const firstIndex = (s: Series) => s.findIndex((v) => v !== null);

  it("follows the documented look-backs", () => {
    expect(firstIndex(sma(closes, 10))).toBe(9);
    expect(firstIndex(ema(closes, 10))).toBe(9);
    expect(firstIndex(wma(closes, 10))).toBe(9);
    expect(firstIndex(rsi(closes, 14))).toBe(14);
    expect(firstIndex(bollinger(closes).middle)).toBe(19);
    expect(firstIndex(atr(candles, 14))).toBe(13);
    const d = adx(candles, 14);
    expect(firstIndex(d.plusDI)).toBe(14);
    expect(firstIndex(d.minusDI)).toBe(14);
    expect(firstIndex(d.adx)).toBe(27);
    const m = macd(closes);
    expect(firstIndex(m.macd)).toBe(25);
    expect(firstIndex(m.signal)).toBe(33);
    expect(firstIndex(m.histogram)).toBe(33);
    const fast = stochastic(candles);
    expect(firstIndex(fast.k)).toBe(13);
    expect(firstIndex(fast.d)).toBe(15);
    const slow = stochastic(candles, { smoothK: 3 });
    expect(firstIndex(slow.k)).toBe(15);
    expect(firstIndex(slow.d)).toBe(17);
    // No fixed warm-up: the first bar with volume has a VWAP.
    expect(firstIndex(vwap(candles.map((c) => ({ ...c, volume: 1 }))))).toBe(0);
  });
});

describe("edge cases", () => {
  it("returns empty series for empty input", () => {
    expect(sma([], 3)).toEqual([]);
    expect(rsi([])).toEqual([]);
    expect(bollinger([])).toEqual({ middle: [], upper: [], lower: [] });
    expect(adx([])).toEqual({ adx: [], plusDI: [], minusDI: [] });
    expect(macd([])).toEqual({ macd: [], signal: [], histogram: [] });
    expect(stochastic([])).toEqual({ k: [], d: [] });
    expect(vwap([])).toEqual([]);
  });

  it("is all null when the input is shorter than the period", () => {
    const closes = [1, 2, 3, 4];
    expect(sma(closes, 5)).toEqual(nulls(4));
    expect(ema(closes, 5)).toEqual(nulls(4));
    expect(wma(closes, 5)).toEqual(nulls(4));
    expect(rsi(closes, 4)).toEqual(nulls(4));
    expect(bollinger(closes, { period: 5 }).upper).toEqual(nulls(4));
    expect(macd(closes, { fastPeriod: 2, slowPeriod: 5 }).macd).toEqual(nulls(4));
  });

  it("period 1 moving averages echo the input", () => {
    const closes = [3, 1, 4, 1, 5];
    expect(sma(closes, 1)).toEqual(closes);
    expect(ema(closes, 1)).toEqual(closes);
    expect(wma(closes, 1)).toEqual(closes);
    expect(bollinger(closes, { period: 1 })).toEqual({
      middle: closes,
      upper: closes,
      lower: closes,
    });
  });

  it("period 1 RSI is 100 on a rise, 0 on a fall and 50 when unchanged", () => {
    expect(rsi([1, 2, 1, 1], 1)).toEqual([null, 100, 0, 50]);
  });

  it("stdDev 0 collapses the bands onto the middle", () => {
    const b = bollinger([1, 5, 2, 8, 3], { period: 3, stdDev: 0 });
    expect(b.upper).toEqual(b.middle);
    expect(b.lower).toEqual(b.middle);
  });

  describe("constant series", () => {
    const flat = Array.from({ length: 40 }, (_, i) => ({
      time: i * 3_600_000,
      open: 10,
      high: 10,
      low: 10,
      close: 10,
      volume: 5,
    }));
    const closes = closesOf(flat);

    it("RSI is 50 (no gains and no losses is neutral, not a division by zero)", () => {
      expect(rsi(closes, 14).slice(14)).toEqual(new Array(26).fill(50));
    });

    it("RSI is 100 with no losses and 0 with no gains", () => {
      const up = Array.from({ length: 20 }, (_, i) => 10 + i);
      expect(rsi(up, 14).slice(14)).toEqual(new Array(6).fill(100));
      expect(rsi([...up].reverse(), 14).slice(14)).toEqual(new Array(6).fill(0));
    });

    it("bands have zero width, ATR / ADX / ±DI are 0, stochastic is 50, VWAP is the price", () => {
      const b = bollinger(closes);
      expect(b.upper.slice(19)).toEqual(new Array(21).fill(10));
      expect(b.lower.slice(19)).toEqual(new Array(21).fill(10));
      expect(atr(flat).slice(13)).toEqual(new Array(27).fill(0));
      const d = adx(flat, 5);
      expect(d.plusDI.slice(5)).toEqual(new Array(35).fill(0));
      expect(d.minusDI.slice(5)).toEqual(new Array(35).fill(0));
      expect(d.adx.slice(9)).toEqual(new Array(31).fill(0));
      expect(stochastic(flat).k.slice(13)).toEqual(new Array(27).fill(50));
      expect(vwap(flat)).toEqual(new Array(40).fill(10));
      expect(macd(closes).histogram.slice(33)).toEqual(new Array(7).fill(0));
    });
  });

  describe("ATR on gaps", () => {
    it("true range spans the gap from the previous close", () => {
      const bar = { time: 0, open: 110, high: 112, low: 108, close: 111 };
      expect(trueRange(bar, undefined)).toBe(4);
      expect(trueRange(bar, 100)).toBe(12); // gap up: high − previous close
      expect(trueRange(bar, 120)).toBe(12); // gap down: previous close − low
      expect(trueRange(bar, 110)).toBe(4); // inside the range: high − low
    });

    it("a gap raises ATR by the gap-inclusive range", () => {
      const candles: Candle[] = [
        { time: 0, open: 100, high: 101, low: 99, close: 100 },
        { time: 1, open: 100, high: 101, low: 99, close: 100 },
        { time: 2, open: 120, high: 121, low: 119, close: 120 }, // gap: TR = 21
      ];
      expect(atr(candles, 2)).toEqual([null, 2, (2 * 1 + 21) / 2]);
    });
  });

  describe("VWAP volume handling", () => {
    const t = Date.UTC(2026, 0, 1);
    const bar = (time: number, price: number, volume?: number): Candle => ({
      time,
      open: price,
      high: price,
      low: price,
      close: price,
      volume,
    });

    it("resets at 00:00 UTC by default", () => {
      const candles = [bar(t + 3600e3, 10, 1), bar(t + 7200e3, 20, 1), bar(t + 86_400e3, 30, 1)];
      expect(vwap(candles)).toEqual([10, 15, 30]);
      expect(vwap(candles, { session: "none" })).toEqual([10, 15, 20]);
    });

    it("treats missing / non-finite volume as 0 and is null while the session has no volume", () => {
      const candles = [
        bar(t, 10),
        bar(t + 1, 20, NaN),
        bar(t + 2, 30, 2),
        bar(t + 3, 40, Infinity),
      ];
      expect(vwap(candles)).toEqual([null, null, 30, 30]);
    });

    it("uses the typical price (high + low + close) / 3", () => {
      const c: Candle = { time: t, open: 0, high: 12, low: 6, close: 9, volume: 3 };
      expect(vwap([c])).toEqual([9]);
    });

    it("rejects negative volume, a non-finite time and an unknown session", () => {
      expect(() => vwap([bar(t, 10, -1)])).toThrow(RangeError);
      expect(() => vwap([bar(NaN, 10, 1)])).toThrow(RangeError);
      expect(() => vwap([], { session: "week" as never })).toThrow(RangeError);
    });
  });
});

describe("parameter validation", () => {
  it.each([0, -1, 1.5, NaN, Infinity])("rejects period %s with RangeError", (p) => {
    expect(() => sma([1], p)).toThrow(RangeError);
    expect(() => createEMA(p)).toThrow(RangeError);
    expect(() => createWMA(p)).toThrow(RangeError);
    expect(() => createSMA(p)).toThrow(RangeError);
    expect(() => createRSI(p)).toThrow(RangeError);
    expect(() => createATR(p)).toThrow(RangeError);
    expect(() => createADX(p)).toThrow(RangeError);
    expect(() => createBollinger({ period: p })).toThrow(RangeError);
    expect(() => createMACD({ signalPeriod: p })).toThrow(RangeError);
    expect(() => createStochastic({ kPeriod: p })).toThrow(RangeError);
    expect(() => createStochastic({ smoothK: p })).toThrow(RangeError);
    expect(() => createStochastic({ dPeriod: p })).toThrow(RangeError);
  });

  it("rejects a negative or non-finite stdDev", () => {
    expect(() => createBollinger({ stdDev: -1 })).toThrow(RangeError);
    expect(() => createBollinger({ stdDev: NaN })).toThrow(RangeError);
  });

  it("requires fastPeriod < slowPeriod", () => {
    expect(() => createMACD({ fastPeriod: 26, slowPeriod: 26 })).toThrow(RangeError);
    expect(() => createMACD({ fastPeriod: 30 })).toThrow(RangeError);
  });

  it("rejects non-finite prices without corrupting calculator state", () => {
    const calc = createEMA(2);
    calc.next(1);
    expect(() => calc.next(NaN)).toThrow(RangeError);
    expect(() => calc.update(Infinity)).toThrow(RangeError);
    expect(calc.next(3)).toBe(2); // the bad inputs never entered the series
    expect(() => sma([1, NaN, 3], 2)).toThrow(RangeError);
    const bad: Candle = { time: 0, open: 1, high: NaN, low: 1, close: 1 };
    expect(() => atr([bad])).toThrow(RangeError);
    expect(() => adx([bad])).toThrow(RangeError);
    expect(() => stochastic([bad])).toThrow(RangeError);
    expect(() => vwap([bad])).toThrow(RangeError);
  });

  it("uses the documented defaults", () => {
    const candles = randomCandles(80, 11);
    const closes = closesOf(candles);
    expect(rsi(closes)).toEqual(rsi(closes, 14));
    expect(atr(candles)).toEqual(atr(candles, 14));
    expect(adx(candles)).toEqual(adx(candles, 14));
    expect(bollinger(closes)).toEqual(bollinger(closes, { period: 20, stdDev: 2 }));
    expect(macd(closes)).toEqual(macd(closes, { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }));
    expect(stochastic(candles)).toEqual(
      stochastic(candles, { kPeriod: 14, smoothK: 1, dPeriod: 3 }),
    );
    expect(vwap(candles)).toEqual(vwap(candles, { session: "day" }));
    expect(createVWAP().next(candles[0])).toBe(vwap(candles)[0]);
  });
});
