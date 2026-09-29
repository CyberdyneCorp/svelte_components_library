import {
  fromCore,
  runBatch,
  type Core,
  type IndicatorCalculator,
  type IndicatorSeries,
  type IndicatorValue,
} from "./calculator.js";
import { assertPeriod, assertValue } from "./validate.js";
import { RollingWindow } from "./window.js";

/** Simple moving average of the last `period` values. First value at index `period − 1`. */
export function smaCore(period: number): Core<number, IndicatorValue> {
  const window = new RollingWindow(period - 1);
  let pending = 0;
  return {
    preview(value) {
      pending = value;
      return window.full ? (window.sum + value) / period : null;
    },
    commit() {
      window.push(pending);
    },
  };
}

/** Linearly weighted moving average: newest weight `period`, oldest weight 1. */
export function wmaCore(period: number): Core<number, IndicatorValue> {
  const window = new RollingWindow(period - 1);
  const divisor = (period * (period + 1)) / 2;
  let pending = 0;
  return {
    preview(value) {
      pending = value;
      return window.full ? (window.weightedSum + period * value) / divisor : null;
    },
    commit() {
      window.push(pending);
    },
  };
}

/**
 * Exponential smoothing `prev + alpha · (value − prev)`, seeded with the SMA of
 * the first `period` values (first value at index `period − 1`).
 * EMA uses `alpha = 2 / (period + 1)`; Wilder's smoothing (RMA) uses `1 / period`.
 */
export function smoothedCore(period: number, alpha: number): Core<number, IndicatorValue> {
  let count = 0;
  let seedSum = 0;
  let value: IndicatorValue = null;
  let next = { count: 0, seedSum: 0, value: null as IndicatorValue };
  return {
    preview(input) {
      const n = count + 1;
      let out: IndicatorValue = null;
      if (value !== null) out = value + alpha * (input - value);
      else if (n === period) out = (seedSum + input) / period;
      next = { count: n, seedSum: seedSum + input, value: out };
      return out;
    },
    commit() {
      ({ count, seedSum, value } = next);
    },
  };
}

export const emaCore = (period: number) => smoothedCore(period, 2 / (period + 1));
export const wilderCore = (period: number) => smoothedCore(period, 1 / period);

function periodCalculator(
  name: string,
  period: number,
  make: (period: number) => Core<number, IndicatorValue>,
): IndicatorCalculator<number, IndicatorValue> {
  assertPeriod(name, period);
  return fromCore(make(period), assertValue);
}

/** Incremental SMA. */
export function createSMA(period: number): IndicatorCalculator<number, IndicatorValue> {
  return periodCalculator("period", period, smaCore);
}

/** Incremental EMA (SMA-seeded). */
export function createEMA(period: number): IndicatorCalculator<number, IndicatorValue> {
  return periodCalculator("period", period, emaCore);
}

/** Incremental WMA. */
export function createWMA(period: number): IndicatorCalculator<number, IndicatorValue> {
  return periodCalculator("period", period, wmaCore);
}

/** Simple moving average. `null` for indices `< period − 1`. */
export function sma(values: readonly number[], period: number): IndicatorSeries {
  return runBatch(values, createSMA(period));
}

/** Exponential moving average seeded with the SMA of the first `period` values. */
export function ema(values: readonly number[], period: number): IndicatorSeries {
  return runBatch(values, createEMA(period));
}

/** Linearly weighted moving average. */
export function wma(values: readonly number[], period: number): IndicatorSeries {
  return runBatch(values, createWMA(period));
}
