import {
  columns,
  fromCore,
  runBatch,
  type Core,
  type IndicatorCalculator,
  type IndicatorSeries,
  type IndicatorValue,
} from "./calculator.js";
import { assertNonNegative, assertPeriod, assertValue } from "./validate.js";
import { RollingWindow } from "./window.js";

export interface BollingerOptions {
  /** Window length. Default 20. */
  period?: number;
  /** Band width in standard deviations. Default 2. */
  stdDev?: number;
}

/** One bar of Bollinger Bands. */
export interface BollingerValue {
  middle: IndicatorValue;
  upper: IndicatorValue;
  lower: IndicatorValue;
}

/** Bollinger Bands as aligned arrays. */
export interface BollingerResult {
  middle: IndicatorSeries;
  upper: IndicatorSeries;
  lower: IndicatorSeries;
}

function bollingerCore(period: number, width: number): Core<number, BollingerValue> {
  const window = new RollingWindow(period - 1);
  let pending = 0;
  return {
    preview(value) {
      pending = value;
      if (!window.full) return { middle: null, upper: null, lower: null };
      const middle = (window.sum + value) / period;
      // Add the pending value to the committed window's M2 (Chan et al. parallel update).
      const delta = value - window.mean;
      const m2 = window.m2 + (delta * delta * window.count) / period;
      const deviation = width * Math.sqrt(Math.max(m2, 0) / period);
      return { middle, upper: middle + deviation, lower: middle - deviation };
    },
    commit() {
      window.push(pending);
    },
  };
}

/** Incremental Bollinger Bands. */
export function createBollinger(
  options: BollingerOptions = {},
): IndicatorCalculator<number, BollingerValue> {
  const { period = 20, stdDev = 2 } = options;
  assertPeriod("period", period);
  assertNonNegative("stdDev", stdDev);
  return fromCore(bollingerCore(period, stdDev), assertValue);
}

/**
 * Bollinger Bands: SMA middle band ± `stdDev` population standard deviations
 * of the same `period` window. First value at index `period − 1`.
 */
export function bollinger(
  values: readonly number[],
  options: BollingerOptions = {},
): BollingerResult {
  return columns(runBatch(values, createBollinger(options)), ["middle", "upper", "lower"]);
}
