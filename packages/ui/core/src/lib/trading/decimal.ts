/**
 * Exact arithmetic on decimal strings for order maths (OpenSpec
 * add-trading-suite, D1). Values are scaled to BigInt integers, so nothing
 * here goes through a JS `number`: `multiplyDecimal("0.1", "3")` is exactly
 * `"0.3"`. Invalid input throws a `RangeError`.
 */
import { fromMinorUnits, toMinorUnits } from "../forms/MoneyInput/money.js";

/** How a quotient is rounded to an integer, see `divideRounded`. */
export type DecimalRounding = "down" | "up" | "nearest";

const DECIMAL_STRING = /^-?(?:\d+\.?\d*|\.\d+)$/;
const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);
const TEN = BigInt(10);

interface Scaled {
  units: bigint;
  scale: number;
}

function parse(value: string): Scaled {
  const text = typeof value === "string" ? value.trim() : "";
  if (!DECIMAL_STRING.test(text)) {
    throw new RangeError(`Invalid decimal: ${JSON.stringify(value)} is not a decimal string`);
  }
  const dot = text.indexOf(".");
  const scale = dot === -1 ? 0 : text.length - dot - 1;
  return { units: toMinorUnits(text, scale), scale };
}

function rescale(value: Scaled, scale: number): bigint {
  return value.units * TEN ** BigInt(scale - value.scale);
}

/** Both operands on their common (largest) scale. */
function aligned(a: string, b: string): [bigint, bigint, number] {
  const pa = parse(a);
  const pb = parse(b);
  const scale = Math.max(pa.scale, pb.scale);
  return [rescale(pa, scale), rescale(pb, scale), scale];
}

/** True when `value` is a plain decimal string ("12", "-0.5", ".25"). */
export function isDecimal(value: unknown): value is string {
  return typeof value === "string" && DECIMAL_STRING.test(value.trim());
}

/**
 * `n / d` (d > 0) rounded to an integer: `"down"` towards negative infinity,
 * `"up"` towards positive infinity, `"nearest"` with ties half away from zero.
 */
export function divideRounded(n: bigint, d: bigint, mode: DecimalRounding): bigint {
  const quotient = n / d; // truncates towards zero
  const remainder = n % d; // carries the sign of n
  if (remainder === ZERO) return quotient;
  switch (mode) {
    case "down":
      return remainder < ZERO ? quotient - ONE : quotient;
    case "up":
      return remainder > ZERO ? quotient + ONE : quotient;
    case "nearest": {
      const twice = TWO * (remainder < ZERO ? -remainder : remainder);
      if (twice < d) return quotient;
      return remainder > ZERO ? quotient + ONE : quotient - ONE;
    }
    default:
      throw new RangeError(`Invalid rounding mode: ${JSON.stringify(mode)}`);
  }
}

/** Sign of `a - b`: -1, 0 or 1. */
export function compareDecimal(a: string, b: string): -1 | 0 | 1 {
  const [x, y] = aligned(a, b);
  if (x === y) return 0;
  return x > y ? 1 : -1;
}

/** Sign of `value`: -1, 0 or 1. */
export function signOf(value: string): -1 | 0 | 1 {
  return compareDecimal(value, "0");
}

/** Exact `a + b`, with the larger fraction-digit count of the two. */
export function addDecimal(a: string, b: string): string {
  const [x, y, scale] = aligned(a, b);
  return fromMinorUnits(x + y, scale);
}

/** Exact `a - b`, with the larger fraction-digit count of the two. */
export function subtractDecimal(a: string, b: string): string {
  const [x, y, scale] = aligned(a, b);
  return fromMinorUnits(x - y, scale);
}

/** Exact `a × b` ("0.015" × "64000" → "960.000"). */
export function multiplyDecimal(a: string, b: string): string {
  const pa = parse(a);
  const pb = parse(b);
  return fromMinorUnits(pa.units * pb.units, pa.scale + pb.scale);
}

/**
 * `a ÷ b` with exactly `digits` fraction digits, rounded by `mode`
 * (default `"down"`): `divideDecimal("1000", "64000", 6)` → `"0.015625"`.
 * Throws when `b` is zero or `digits` is not a non-negative integer.
 */
export function divideDecimal(
  a: string,
  b: string,
  digits: number,
  mode: DecimalRounding = "down",
): string {
  if (!Number.isInteger(digits) || digits < 0) {
    throw new RangeError(`Invalid fraction digits: ${digits}`);
  }
  const pa = parse(a);
  const pb = parse(b);
  if (pb.units === ZERO) throw new RangeError("Division by zero");
  let n = pa.units * TEN ** BigInt(pb.scale + digits);
  let d = pb.units * TEN ** BigInt(pa.scale);
  if (d < ZERO) {
    n = -n;
    d = -d;
  }
  return fromMinorUnits(divideRounded(n, d, mode), digits);
}

/** Drops trailing fraction zeros: "0.0150" → "0.015", "64000.0" → "64000", "-0" → "0". */
export function trimDecimal(value: string): string {
  const { units, scale } = parse(value);
  const text = fromMinorUnits(units, scale);
  const trimmed = text.includes(".") ? text.replace(/\.?0+$/, "") : text;
  return trimmed === "-0" ? "0" : trimmed;
}

// ── Fixed-scale helpers (order book aggregation, display) ──────────

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

/** True when `value` is a positive whole multiple of `step` (both positive decimal strings). */
export function isMultipleOf(value: string, step: string): boolean {
  if (!isDecimal(value) || !isDecimal(step)) return false;
  if (signOf(step) <= 0 || signOf(value) <= 0) return false;
  const scale = commonScale([value, step]);
  return scaled(value, scale) % scaled(step, scale) === ZERO;
}

/** `step × factor` (an integer) with the step's precision: ("0.01", 10) → "0.10". */
export function multiplyByInteger(step: string, factor: number): string {
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
  return unscaled(units * TEN ** BigInt(places - scale), 0);
}
