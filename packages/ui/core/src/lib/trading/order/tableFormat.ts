/**
 * Cell formatting for PositionsTable / OpenOrdersTable. Values stay decimal
 * strings; a row whose market has no `MarketSpec` shows the raw string.
 */
import { divideDecimal, isDecimal, signOf } from "../decimal.js";
import { formatPrice, formatSize } from "../format.js";
import type { MarketSpec } from "../types.js";

export type Markets = Record<string, MarketSpec>;
export type PnlTone = "long" | "short" | "flat";

export function priceCell(value: string | undefined, market: MarketSpec | undefined, locale?: string) {
  if (value === undefined || value === "") return undefined;
  return market && isDecimal(value) ? formatPrice(value, market, locale) : value;
}

export function sizeCell(value: string, market: MarketSpec | undefined, locale?: string): string {
  return market && isDecimal(value) ? formatSize(value, market, locale) : value;
}

/**
 * Quote amount rounded to `digits`; `signed` adds an explicit sign
 * ("+12.50", "-3.20", "0.00") for PnL.
 */
export function quoteAmount(value: string, digits: number, locale?: string, signed = false): string {
  if (!isDecimal(value)) return value;
  const rounded = divideDecimal(value, "1", digits, "nearest");
  // String input is NumberFormat v3 (ES2023); the cast bridges ES2022 typings.
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: signed ? "exceptZero" : "auto",
  });
  return formatter.format(rounded as unknown as number);
}

/** Trade-token tone of a signed value: positive → long, negative → short. */
export function pnlTone(value: string): PnlTone {
  if (!isDecimal(value)) return "flat";
  const sign = signOf(value);
  if (sign === 0) return "flat";
  return sign > 0 ? "long" : "short";
}

export function timeCell(time: number, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "medium" }).format(time);
}
