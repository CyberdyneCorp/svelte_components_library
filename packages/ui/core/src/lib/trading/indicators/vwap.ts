import type { Candle } from "../types.js";
import {
  fromCore,
  runBatch,
  type Core,
  type IndicatorCalculator,
  type IndicatorSeries,
  type IndicatorValue,
} from "./calculator.js";
import { assertCandle } from "./validate.js";

/**
 * When VWAP restarts. `"day"` (default) resets at 00:00 UTC, `"none"` never
 * resets (anchored at the first bar), and a function maps a bar's `time` to a
 * session key: VWAP resets whenever the key changes (e.g. a local-time day or
 * an exchange session).
 */
export type VwapSession = "day" | "none" | ((time: number) => string | number);

export interface VwapOptions {
  session?: VwapSession;
}

const DAY_MS = 86_400_000;

function sessionKeyFn(session: VwapSession): (time: number) => string | number {
  if (typeof session === "function") return session;
  if (session === "none") return () => 0;
  if (session === "day") return (time) => Math.floor(time / DAY_MS);
  throw new RangeError(`session must be "day", "none" or a function, got ${String(session)}`);
}

/** Missing, NaN or infinite volume counts as 0 (the bar adds no weight). */
function volumeOf(candle: Candle): number {
  const volume = candle.volume;
  return volume !== undefined && Number.isFinite(volume) ? volume : 0;
}

function checkVwapCandle(candle: Candle): void {
  assertCandle(candle);
  if (!Number.isFinite(candle.time)) {
    throw new RangeError(`candle time must be a finite number, got ${candle.time}`);
  }
  if (volumeOf(candle) < 0) {
    throw new RangeError(`candle volume must be ≥ 0, got ${candle.volume} (time ${candle.time})`);
  }
}

function vwapCore(sessionKey: (time: number) => string | number): Core<Candle, IndicatorValue> {
  let committed = { key: undefined as string | number | undefined, pv: 0, volume: 0 };
  let pending = committed;
  return {
    preview(candle) {
      const key = sessionKey(candle.time);
      const base = key === committed.key ? committed : { key, pv: 0, volume: 0 };
      const volume = volumeOf(candle);
      const typical = (candle.high + candle.low + candle.close) / 3;
      pending = { key, pv: base.pv + typical * volume, volume: base.volume + volume };
      return pending.volume > 0 ? pending.pv / pending.volume : null;
    },
    commit() {
      committed = pending;
    },
  };
}

/** Incremental VWAP. */
export function createVWAP(options: VwapOptions = {}): IndicatorCalculator<Candle, IndicatorValue> {
  const sessionKey = sessionKeyFn(options.session ?? "day");
  return fromCore(vwapCore(sessionKey), checkVwapCandle);
}

/**
 * Volume-weighted average price of the typical price (high + low + close) / 3,
 * cumulative within each session. There is no fixed warm-up: a value is `null`
 * only while its session has no volume yet (missing / non-finite volume counts
 * as 0, negative volume throws).
 */
export function vwap(candles: readonly Candle[], options: VwapOptions = {}): IndicatorSeries {
  return runBatch(candles, createVWAP(options));
}
