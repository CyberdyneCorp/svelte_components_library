import type { Candle } from "../types.js";
import { trueRange } from "./atr.js";
import { wilderCore } from "./averages.js";
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

/** One bar of the Directional Movement System. */
export interface AdxValue {
  adx: IndicatorValue;
  plusDI: IndicatorValue;
  minusDI: IndicatorValue;
}

/** ADX, +DI and −DI as aligned arrays. */
export interface AdxResult {
  adx: IndicatorSeries;
  plusDI: IndicatorSeries;
  minusDI: IndicatorSeries;
}

interface Movement {
  tr: number;
  plusDM: number;
  minusDM: number;
}

/** Wilder's directional movement: only the larger of the up / down moves counts, and only if positive. */
function movement(candle: Candle, previous: Candle): Movement {
  const up = candle.high - previous.high;
  const down = previous.low - candle.low;
  return {
    tr: trueRange(candle, previous.close),
    plusDM: up > down && up > 0 ? up : 0,
    minusDM: down > up && down > 0 ? down : 0,
  };
}

const ratio = (part: number, whole: number) => (whole === 0 ? 0 : (100 * part) / whole);

function adxCore(period: number): Core<Candle, AdxValue> {
  const tr = gated(wilderCore(period));
  const plus = gated(wilderCore(period));
  const minus = gated(wilderCore(period));
  const adx = gated(wilderCore(period));
  let previous: Candle | undefined;
  let pending: Candle | undefined;
  return {
    preview(candle) {
      // Copy: callers may mutate a live candle object in place between ticks.
      pending = { ...candle };
      const move = previous === undefined ? undefined : movement(candle, previous);
      const smoothedTR = tr.preview(move?.tr ?? null);
      const smoothedPlus = plus.preview(move?.plusDM ?? null);
      const smoothedMinus = minus.preview(move?.minusDM ?? null);
      if (smoothedTR === null || smoothedPlus === null || smoothedMinus === null) {
        adx.preview(null);
        return { adx: null, plusDI: null, minusDI: null };
      }
      const plusDI = ratio(smoothedPlus, smoothedTR);
      const minusDI = ratio(smoothedMinus, smoothedTR);
      const dx = ratio(Math.abs(plusDI - minusDI), plusDI + minusDI);
      return { adx: adx.preview(dx), plusDI, minusDI };
    },
    commit() {
      tr.commit();
      plus.commit();
      minus.commit();
      adx.commit();
      previous = pending;
    },
  };
}

/** Incremental ADX / +DI / −DI. */
export function createADX(period = 14): IndicatorCalculator<Candle, AdxValue> {
  assertPeriod("period", period);
  return fromCore(adxCore(period), assertCandle);
}

/**
 * Wilder's Average Directional Index with +DI and −DI. True range and
 * directional movement start at the second bar and are Wilder-smoothed, so
 * ±DI start at index `period`; ADX is the Wilder smoothing of DX and starts at
 * index `2 · period − 1`. Zero denominators (no range, no movement) give 0.
 */
export function adx(candles: readonly Candle[], period = 14): AdxResult {
  return columns(runBatch(candles, createADX(period)), ["adx", "plusDI", "minusDI"]);
}
