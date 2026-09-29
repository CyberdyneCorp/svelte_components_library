import { wilderCore } from "./averages.js";
import {
  fromCore,
  gated,
  runBatch,
  type Core,
  type IndicatorCalculator,
  type IndicatorSeries,
  type IndicatorValue,
} from "./calculator.js";
import { assertPeriod, assertValue } from "./validate.js";

/**
 * RSI from Wilder-smoothed average gain and loss. With no losses it is 100, with
 * no gains 0; a completely flat window (no gains and no losses) is 50 (neutral)
 * rather than a division by zero.
 */
export function rsiFromAverages(gain: number, loss: number): number {
  const total = gain + loss;
  return total === 0 ? 50 : (100 * gain) / total;
}

function rsiCore(period: number): Core<number, IndicatorValue> {
  const gains = gated(wilderCore(period));
  const losses = gated(wilderCore(period));
  let previous: number | undefined;
  let pending = 0;
  return {
    preview(close) {
      pending = close;
      const change = previous === undefined ? null : close - previous;
      const gain = gains.preview(change === null ? null : Math.max(change, 0));
      const loss = losses.preview(change === null ? null : Math.max(-change, 0));
      return gain === null || loss === null ? null : rsiFromAverages(gain, loss);
    },
    commit() {
      gains.commit();
      losses.commit();
      previous = pending;
    },
  };
}

/** Incremental RSI. */
export function createRSI(period = 14): IndicatorCalculator<number, IndicatorValue> {
  assertPeriod("period", period);
  return fromCore(rsiCore(period), assertValue);
}

/**
 * Wilder's Relative Strength Index (0–100). The first value is at index
 * `period`: the first average gain/loss is the plain mean of the first `period`
 * changes, later ones use Wilder smoothing.
 */
export function rsi(values: readonly number[], period = 14): IndicatorSeries {
  return runBatch(values, createRSI(period));
}
