import type { Candle } from "../types.js";
import { smaCore } from "./averages.js";
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
import { assertCandle, assertPeriod } from "./validate.js";
import { RollingExtremum } from "./window.js";

export interface StochasticOptions {
  /** Look-back for the highest high / lowest low. Default 14. */
  kPeriod?: number;
  /**
   * SMA smoothing of %K. Default 1 (fast stochastic, as TradingView's default);
   * use 3 for the classic slow stochastic.
   */
  smoothK?: number;
  /** SMA length of %D over %K. Default 3. */
  dPeriod?: number;
}

/** One bar of the stochastic oscillator. */
export interface StochasticValue {
  k: IndicatorValue;
  d: IndicatorValue;
}

/** %K and %D as aligned arrays. */
export interface StochasticResult {
  k: IndicatorSeries;
  d: IndicatorSeries;
}

/** Raw %K over the last `period` bars: where the close sits in the high–low range. */
function rangePositionCore(period: number): Core<Candle, IndicatorValue> {
  const highs = new RollingExtremum(period - 1, "max");
  const lows = new RollingExtremum(period - 1, "min");
  let committed = 0;
  let pending = { high: 0, low: 0 };
  return {
    preview(candle) {
      pending = { high: candle.high, low: candle.low };
      if (committed < period - 1) return null;
      const highest = Math.max(highs.value ?? candle.high, candle.high);
      const lowest = Math.min(lows.value ?? candle.low, candle.low);
      const range = highest - lowest;
      // A flat range has no position; report the midpoint rather than dividing by zero.
      return range === 0 ? 50 : (100 * (candle.close - lowest)) / range;
    },
    commit() {
      highs.push(pending.high);
      lows.push(pending.low);
      committed++;
    },
  };
}

function stochasticCore(
  kPeriod: number,
  smoothK: number,
  dPeriod: number,
): Core<Candle, StochasticValue> {
  const raw = rangePositionCore(kPeriod);
  const kLine = gated(smaCore(smoothK));
  const dLine = gated(smaCore(dPeriod));
  return {
    preview(candle) {
      const k = kLine.preview(raw.preview(candle));
      return { k, d: dLine.preview(k) };
    },
    commit() {
      raw.commit();
      kLine.commit();
      dLine.commit();
    },
  };
}

/** Incremental stochastic oscillator. */
export function createStochastic(
  options: StochasticOptions = {},
): IndicatorCalculator<Candle, StochasticValue> {
  const { kPeriod = 14, smoothK = 1, dPeriod = 3 } = options;
  assertPeriod("kPeriod", kPeriod);
  assertPeriod("smoothK", smoothK);
  assertPeriod("dPeriod", dPeriod);
  return fromCore(stochasticCore(kPeriod, smoothK, dPeriod), assertCandle);
}

/**
 * Stochastic oscillator (0–100). %K = SMA(`smoothK`) of
 * 100 · (close − lowest low) / (highest high − lowest low) over `kPeriod` bars
 * (50 when the range is flat); %D = SMA(`dPeriod`) of %K. %K starts at index
 * `kPeriod + smoothK − 2`, %D `dPeriod − 1` bars later.
 */
export function stochastic(
  candles: readonly Candle[],
  options: StochasticOptions = {},
): StochasticResult {
  return columns(runBatch(candles, createStochastic(options)), ["k", "d"]);
}
