/**
 * Minimal decimal-string arithmetic for the market-data widgets (design D1).
 * Values are scaled to a shared number of fraction digits and handled as
 * BigInt, so sums of sizes never pick up float noise.
 */
import { fromMinorUnits, toMinorUnits } from "../../forms/MoneyInput/money.js";

const DECIMAL = /^-?(?:\d+\.?\d*|\.\d+)$/;
const ZERO = BigInt(0);

/** True for a plain decimal string such as "12", "-0.5" or ".25". */
export function isDecimal(value: unknown): value is string {
  return typeof value === "string" && DECIMAL.test(value.trim());
}

/** Fraction digits written in a decimal string ("1.50" → 2). */
export function scaleOf(value: string): number {
  const text = value.trim();
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

/** Largest fraction-digit count across `values`. */
export function commonScale(values: readonly string[]): number {
  return values.reduce((max, value) => Math.max(max, scaleOf(value)), 0);
}

/** Decimal string → BigInt scaled by 10^scale. */
export function scaled(value: string, scale: number): bigint {
  return toMinorUnits(value, scale);
}

/** BigInt scaled by 10^scale → decimal string. */
export function unscaled(value: bigint, scale: number): string {
  return fromMinorUnits(value, scale);
}

/** Exact `a - b` for two decimal strings. */
export function subtract(a: string, b: string): string {
  const scale = commonScale([a, b]);
  return unscaled(scaled(a, scale) - scaled(b, scale), scale);
}

/** Sign of `a - b` (-1, 0 or 1). */
export function compare(a: string, b: string): number {
  const scale = commonScale([a, b]);
  const diff = scaled(a, scale) - scaled(b, scale);
  if (diff === ZERO) return 0;
  return diff > ZERO ? 1 : -1;
}

/** Sign of a decimal string (-1, 0 or 1). */
export function signOf(value: string): number {
  return compare(value, "0");
}

/** True when `value` is a positive whole multiple of `step` (both positive decimal strings). */
export function isMultipleOf(value: string, step: string): boolean {
  if (!isDecimal(value) || !isDecimal(step)) return false;
  if (signOf(step) <= 0 || signOf(value) <= 0) return false;
  const scale = commonScale([value, step]);
  return scaled(value, scale) % scaled(step, scale) === ZERO;
}

/** `step × factor` as a decimal string with the step's precision. */
export function multiply(step: string, factor: number): string {
  const scale = scaleOf(step);
  return unscaled(scaled(step, scale) * BigInt(factor), scale);
}

/**
 * Moves the decimal point `places` to the right, exactly:
 * `shiftPoint("0.0001", 2)` → `"0.01"`. Shows a funding-rate fraction as a percentage.
 */
export function shiftPoint(value: string, places: number): string {
  const scale = scaleOf(value);
  const units = scaled(value, scale);
  if (scale >= places) return unscaled(units, scale - places);
  return unscaled(units * BigInt(10) ** BigInt(places - scale), 0);
}
