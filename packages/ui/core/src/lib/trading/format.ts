/**
 * Price / size precision helpers for trading UIs (OpenSpec add-trading-suite, D1).
 *
 * Rounding works on decimal strings through BigInt minor units (the MoneyInput
 * helpers), never through a JS `number`, so an order never carries float noise
 * such as 0.30000000000000004. Formatting accepts a number (chart values) or a
 * decimal string (order values); strings are formatted exactly by Intl.
 */
import { MAX_ASSET_DECIMALS } from "../forms/MoneyInput/asset.js";
import { fromMinorUnits, toMinorUnits } from "../forms/MoneyInput/money.js";
import type { MarketSpec } from "./types.js";

/**
 * - `"down"`: towards negative infinity (floor), so a positive size never grows.
 * - `"up"`: towards positive infinity (ceiling).
 * - `"nearest"`: to the closest multiple; an exact tie rounds half away from zero.
 */
export type RoundingMode = "down" | "up" | "nearest";

const DECIMAL_STRING = /^-?(?:\d+\.?\d*|\.\d+)$/;
const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);
const TEN = BigInt(10);

/** Validates a plain decimal string ("12", "-0.5", ".25", "10.") and returns its fraction digit count. */
function fractionDigits(value: string, what: string): number {
  const text = typeof value === "string" ? value.trim() : "";
  if (!DECIMAL_STRING.test(text)) {
    throw new RangeError(`Invalid ${what}: ${JSON.stringify(value)} is not a decimal string`);
  }
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

/**
 * Number of fraction digits a tick or step size needs: "0.5" → 1,
 * "0.01" → 2, "0.010" → 2, "5" → 0. Throws unless `step` is a positive
 * decimal string.
 */
export function precisionOf(step: string): number {
  const digits = fractionDigits(step, "step size");
  if (toMinorUnits(step, digits) <= ZERO) {
    throw new RangeError(`Invalid step size: "${step}" must be greater than zero`);
  }
  const fraction = step.trim().split(".")[1] ?? "";
  return fraction.replace(/0+$/, "").length;
}

/** `n / d` (d > 0) rounded to an integer by `mode`. */
function divideRounded(n: bigint, d: bigint, mode: RoundingMode): bigint {
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

/** Rounds `value` to a multiple of `increment`, returned with the increment's precision. */
function roundToIncrement(
  value: string,
  increment: string,
  mode: RoundingMode,
  what: string,
): string {
  const precision = precisionOf(increment);
  const scale = Math.max(fractionDigits(value, what), precision);
  const scaledIncrement = toMinorUnits(increment, scale);
  const units = divideRounded(toMinorUnits(value, scale), scaledIncrement, mode);
  const result = (units * scaledIncrement) / TEN ** BigInt(scale - precision);
  return fromMinorUnits(result, precision);
}

/**
 * Rounds a decimal-string price to a multiple of `tickSize`, with exactly the
 * tick's precision: `roundToTick("64123.74", "0.5")` → `"64123.5"`.
 * Throws on a non-decimal price, a non-positive tick or an unknown mode.
 */
export function roundToTick(
  price: string,
  tickSize: string,
  mode: RoundingMode = "nearest",
): string {
  return roundToIncrement(price, tickSize, mode, "price");
}

/**
 * Rounds a decimal-string size to a multiple of `stepSize`. Defaults to
 * `"down"`, so an order size is never rounded up by accident:
 * `roundToStep("0.12399", "0.001")` → `"0.123"`.
 */
export function roundToStep(size: string, stepSize: string, mode: RoundingMode = "down"): string {
  return roundToIncrement(size, stepSize, mode, "size");
}

function checkPrecision(digits: number, what: string): number {
  if (!Number.isInteger(digits) || digits < 0 || digits > MAX_ASSET_DECIMALS) {
    throw new RangeError(`Invalid ${what}: ${digits}`);
  }
  return digits;
}

/** Locale formatting with exactly `digits` fraction digits; strings format without float conversion. */
function formatDecimal(
  value: number | string,
  digits: number,
  what: string,
  locale?: string,
): string {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new RangeError(`Invalid ${what}: ${value}`);
  } else {
    fractionDigits(value, what);
  }
  // String input and signDisplay "negative" are NumberFormat v3 (ES2023);
  // the casts only bridge our ES2022 lib typings. "negative" drops the sign
  // of a value that rounds to zero ("-0.001" → "0.00").
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: "negative",
  } as unknown as Intl.NumberFormatOptions);
  const input = typeof value === "number" ? value : value.trim();
  return formatter.format(input as unknown as number);
}

/** Fraction digits for prices: `pricePrecision`, else derived from `tickSize`. */
export function pricePrecisionOf(market: Pick<MarketSpec, "tickSize" | "pricePrecision">): number {
  return market.pricePrecision !== undefined
    ? checkPrecision(market.pricePrecision, "price precision")
    : precisionOf(market.tickSize);
}

/** Fraction digits for sizes: `sizePrecision`, else derived from `stepSize`. */
export function sizePrecisionOf(market: Pick<MarketSpec, "stepSize" | "sizePrecision">): number {
  return market.sizePrecision !== undefined
    ? checkPrecision(market.sizePrecision, "size precision")
    : precisionOf(market.stepSize);
}

/**
 * Formats a price with the market's precision, e.g. tick "0.01" in en-US:
 * `formatPrice(64123.5, market, "en-US")` → `"64,123.50"`. Extra digits are
 * rounded half away from zero for display; it does not snap to the tick (use
 * `roundToTick` for that).
 */
export function formatPrice(
  value: number | string,
  market: Pick<MarketSpec, "tickSize" | "pricePrecision">,
  locale?: string,
): string {
  return formatDecimal(value, pricePrecisionOf(market), "price", locale);
}

/** Formats a size with the market's precision (`sizePrecision` or derived from `stepSize`). */
export function formatSize(
  value: number | string,
  market: Pick<MarketSpec, "stepSize" | "sizePrecision">,
  locale?: string,
): string {
  return formatDecimal(value, sizePrecisionOf(market), "size", locale);
}
