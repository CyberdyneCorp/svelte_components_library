import { describe, expect, it } from "vitest";
import { makeCandles } from "../../_testdata/canvas.js";
import { adx, atr, bollinger, ema, macd, rsi, sma, stochastic, vwap, wma } from "../indicators/index.js";
import type { IndicatorValue } from "../indicators/index.js";
import { INDICATOR_BINDINGS, sourceValue } from "./indicatorBindings.js";
import type { IndicatorConfig, IndicatorType } from "./types.js";

const candles = makeCandles(120);
const closes = candles.map((c) => c.close);

/** Feeds candles bar by bar, revising each bar once with `update` before the next arrives. */
function runLive(config: IndicatorConfig) {
  const calc = INDICATOR_BINDINGS[config.type].create(config);
  const rows = candles.map((candle) => {
    calc.next({ ...candle, close: candle.open });
    return calc.update(candle);
  });
  const keys = INDICATOR_BINDINGS[config.type].outputs.map((o) => o.key);
  return Object.fromEntries(keys.map((key) => [key, rows.map((row) => row[key] ?? null)]));
}

const cases: [IndicatorConfig, Record<string, IndicatorValue[]>][] = [
  [{ type: "sma", period: 10 }, { value: sma(closes, 10) }],
  [{ type: "ema", period: 9 }, { value: ema(closes, 9) }],
  [{ type: "wma", period: 5 }, { value: wma(closes, 5) }],
  [{ type: "rsi", period: 14 }, { value: rsi(closes, 14) }],
  [{ type: "bollinger", period: 20, stdDev: 2 }, { ...bollinger(closes, { period: 20, stdDev: 2 }) }],
  [{ type: "atr", period: 14 }, { value: atr(candles, 14) }],
  [{ type: "adx", period: 14 }, { ...adx(candles, 14) }],
  [{ type: "macd", fastPeriod: 5, slowPeriod: 10, signalPeriod: 4 }, { ...macd(closes, { fastPeriod: 5, slowPeriod: 10, signalPeriod: 4 }) }],
  [{ type: "stochastic", kPeriod: 14, smoothK: 3, dPeriod: 3 }, { ...stochastic(candles, { kPeriod: 14, smoothK: 3, dPeriod: 3 }) }],
  [{ type: "vwap" }, { value: vwap(candles) }],
];

describe("indicator bindings", () => {
  it("cover every function in trading/indicators", () => {
    const types: IndicatorType[] = ["sma", "ema", "wma", "rsi", "bollinger", "atr", "adx", "macd", "stochastic", "vwap"];
    expect(Object.keys(INDICATOR_BINDINGS).sort()).toEqual([...types].sort());
  });

  it.each(cases)("%o matches the batch function, including last-bar revisions", (config, expected) => {
    expect(runLive(config)).toEqual(expected);
  });

  it("describes panes, guides, ranges and bands", () => {
    const b = INDICATOR_BINDINGS;
    expect([b.sma.overlay, b.bollinger.overlay, b.vwap.overlay, b.rsi.overlay, b.macd.overlay]).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
    expect(b.rsi.guides?.({ type: "rsi" })).toEqual([30, 70]);
    expect(b.rsi.guides?.({ type: "rsi", oversold: 25, overbought: 75 })).toEqual([25, 75]);
    expect(b.stochastic.guides?.({ type: "stochastic" })).toEqual([20, 80]);
    expect(b.rsi.range).toEqual([0, 100]);
    expect(b.bollinger.band).toEqual(["upper", "lower"]);
    expect(b.macd.includeZero).toBe(true);
    expect(b.macd.outputs.find((o) => o.key === "histogram")?.style).toBe("histogram");
  });

  it("titles default parameters", () => {
    const b = INDICATOR_BINDINGS;
    expect(b.ema.params({ type: "ema", period: 21 })).toEqual([21]);
    expect(b.rsi.params({ type: "rsi" })).toEqual([14]);
    expect(b.bollinger.params({ type: "bollinger" })).toEqual([20, 2]);
    expect(b.atr.params({ type: "atr" })).toEqual([14]);
    expect(b.adx.params({ type: "adx" })).toEqual([14]);
    expect(b.macd.params({ type: "macd" })).toEqual([12, 26, 9]);
    expect(b.stochastic.params({ type: "stochastic" })).toEqual([14, 1, 3]);
    expect(b.vwap.params({ type: "vwap" })).toEqual([]);
  });

  it("uses the configured price source", () => {
    const calc = INDICATOR_BINDINGS.sma.create({ type: "sma", period: 1, source: "high" });
    expect(calc.next(candles[0])).toEqual({ value: candles[0].high });
  });

  it("throws RangeError for invalid parameters", () => {
    expect(() => INDICATOR_BINDINGS.ema.create({ type: "ema", period: 0 })).toThrow(RangeError);
    expect(() => INDICATOR_BINDINGS.macd.create({ type: "macd", fastPeriod: 30, slowPeriod: 10 })).toThrow(RangeError);
  });

  it("derives source prices", () => {
    const c = { time: 0, open: 1, high: 4, low: 0, close: 3 };
    expect(sourceValue(c)).toBe(3);
    expect(sourceValue(c, "open")).toBe(1);
    expect(sourceValue(c, "high")).toBe(4);
    expect(sourceValue(c, "low")).toBe(0);
    expect(sourceValue(c, "hl2")).toBe(2);
    expect(sourceValue(c, "hlc3")).toBeCloseTo(7 / 3);
    expect(sourceValue(c, "ohlc4")).toBe(2);
  });
});
