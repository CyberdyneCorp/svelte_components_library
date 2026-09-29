import { emaCore } from "./averages.js";
import {
  columns,
  fromCore,
  gated,
  runBatch,
  type Core,
  type IndicatorCalculator,
  type IndicatorSeries,
  type IndicatorValue,
} from "./calculator.js";
import { assertPeriod, assertValue } from "./validate.js";

export interface MacdOptions {
  /** Fast EMA length. Default 12. */
  fastPeriod?: number;
  /** Slow EMA length. Default 26; must be greater than `fastPeriod`. */
  slowPeriod?: number;
  /** Signal EMA length (over the MACD line). Default 9. */
  signalPeriod?: number;
}

/** One bar of MACD. */
export interface MacdValue {
  macd: IndicatorValue;
  signal: IndicatorValue;
  histogram: IndicatorValue;
}

/** MACD line, signal line and histogram as aligned arrays. */
export interface MacdResult {
  macd: IndicatorSeries;
  signal: IndicatorSeries;
  histogram: IndicatorSeries;
}

function macdCore(fast: number, slow: number, signalPeriod: number): Core<number, MacdValue> {
  const fastEma = emaCore(fast);
  const slowEma = emaCore(slow);
  const signalEma = gated(emaCore(signalPeriod));
  return {
    preview(value) {
      const f = fastEma.preview(value);
      const s = slowEma.preview(value);
      const macd = f === null || s === null ? null : f - s;
      const signal = signalEma.preview(macd);
      const histogram = macd === null || signal === null ? null : macd - signal;
      return { macd, signal, histogram };
    },
    commit() {
      fastEma.commit();
      slowEma.commit();
      signalEma.commit();
    },
  };
}

/** Incremental MACD. */
export function createMACD(options: MacdOptions = {}): IndicatorCalculator<number, MacdValue> {
  const { fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = options;
  assertPeriod("fastPeriod", fastPeriod);
  assertPeriod("slowPeriod", slowPeriod);
  assertPeriod("signalPeriod", signalPeriod);
  if (fastPeriod >= slowPeriod) {
    throw new RangeError(`fastPeriod (${fastPeriod}) must be less than slowPeriod (${slowPeriod})`);
  }
  return fromCore(macdCore(fastPeriod, slowPeriod, signalPeriod), assertValue);
}

/**
 * MACD: fast EMA − slow EMA (both SMA-seeded, each from the first bar), a signal
 * EMA of that line, and their difference as the histogram. With (12, 26, 9) the
 * MACD line starts at index 25 and signal / histogram at index 33.
 */
export function macd(values: readonly number[], options: MacdOptions = {}): MacdResult {
  return columns(runBatch(values, createMACD(options)), ["macd", "signal", "histogram"]);
}
