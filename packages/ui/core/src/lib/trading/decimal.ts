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
