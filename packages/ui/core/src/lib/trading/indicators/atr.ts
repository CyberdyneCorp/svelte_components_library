import type { Candle } from "../types.js";
import { wilderCore } from "./averages.js";
import {
  fromCore,
  runBatch,
  type Core,
  type IndicatorCalculator,
  type IndicatorSeries,
  type IndicatorValue,
} from "./calculator.js";
import { assertCandle, assertPeriod } from "./validate.js";

/**
 * True range: the largest of high − low, |high − previous close| and
 * |low − previous close|, so overnight gaps count. Without a previous close
 * (the first bar) it is high − low.
 */
export function trueRange(candle: Candle, previousClose: number | undefined): number {
  const range = candle.high - candle.low;
  if (previousClose === undefined) return range;
  return Math.max(
    range,
    Math.abs(candle.high - previousClose),
    Math.abs(candle.low - previousClose),
  );
}

function atrCore(period: number): Core<Candle, IndicatorValue> {
  const average = wilderCore(period);
  let previousClose: number | undefined;
  let pendingClose = 0;
  return {
    preview(candle) {
      pendingClose = candle.close;
      return average.preview(trueRange(candle, previousClose));
    },
    commit() {
      average.commit();
      previousClose = pendingClose;
    },
  };
}

/** Incremental ATR. */
export function createATR(period = 14): IndicatorCalculator<Candle, IndicatorValue> {
  assertPeriod("period", period);
  return fromCore(atrCore(period), assertCandle);
}

/**
 * Wilder's Average True Range. The first bar's true range is high − low; the
 * first ATR (index `period − 1`) is the mean of the first `period` true ranges,
 * later values use Wilder smoothing. This matches Wilder's worked example as
 * published by StockCharts; TA-Lib skips the first bar and starts one bar later.
 */
export function atr(candles: readonly Candle[], period = 14): IndicatorSeries {
  return runBatch(candles, createATR(period));
}
