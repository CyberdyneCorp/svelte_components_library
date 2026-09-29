import type { Candle } from "../types.js";

/** Throw unless `value` is an integer ≥ 1. */
export function assertPeriod(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} must be an integer ≥ 1, got ${value}`);
  }
}

/** Throw unless `value` is a finite number ≥ 0. */
export function assertNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite number ≥ 0, got ${value}`);
  }
}

/** Price inputs must be finite: a NaN would silently poison every later value of a recursive indicator. */
export function assertValue(value: number): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`indicator input must be a finite number, got ${value}`);
  }
}

/** Validate the fields the candle-based indicators read (`high`, `low`, `close`). */
export function assertCandle(candle: Candle): void {
  if (
    !Number.isFinite(candle.high) ||
    !Number.isFinite(candle.low) ||
    !Number.isFinite(candle.close)
  ) {
    throw new RangeError(`candle high/low/close must be finite numbers (time ${candle.time})`);
  }
}
