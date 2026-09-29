/**
 * Cached number formatters for axis labels, the legend and the data table.
 * Prices use the market precision (`pricePrecisionOf`); without a market the
 * precision follows the magnitude of the values.
 */
import { pricePrecisionOf } from "../../format.js";
import type { MarketSpec } from "../../types.js";

export interface NumberFormatter {
  (value: number): string;
  readonly digits: number;
}

const cache = new Map<string, Intl.NumberFormat>();

function formatterFor(locale: string | undefined, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale ?? ""}|${JSON.stringify(options)}`;
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter;
}

/** Fixed-digit formatter; non-finite values print as an empty string. */
export function fixedFormatter(digits: number, locale?: string): NumberFormatter {
  const formatter = formatterFor(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const format = (value: number) => (Number.isFinite(value) ? formatter.format(value) : "");
  return Object.assign(format, { digits });
}

/** Digits that show a value of this magnitude with about five significant figures. */
export function autoDigits(magnitude: number): number {
  const abs = Math.abs(magnitude);
  if (!Number.isFinite(abs) || abs >= 1000) return 2;
  if (abs === 0) return 2;
  return Math.min(8, Math.max(2, 4 - Math.floor(Math.log10(abs))));
}

/** Price digits: the market's, else derived from `magnitude`. */
export function priceDigits(market: MarketSpec | undefined, magnitude: number): number {
  return market ? pricePrecisionOf(market) : autoDigits(magnitude);
}

/** Compact volume text such as "1.2K" or "3.4M". */
export function volumeFormatter(locale?: string): NumberFormatter {
  const formatter = formatterFor(locale, { notation: "compact", maximumFractionDigits: 2 });
  const format = (value: number) => (Number.isFinite(value) ? formatter.format(value) : "");
  return Object.assign(format, { digits: 2 });
}

/** Signed percentage such as "+1.23%". */
export function percentFormatter(locale?: string): NumberFormatter {
  const formatter = formatterFor(locale, {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
  });
  const format = (value: number) => (Number.isFinite(value) ? formatter.format(value) : "");
  return Object.assign(format, { digits: 2 });
}
