/** Display helpers shared by the market-data widgets. */
import { formatPrice } from "../format.js";
import type { MarketSpec } from "../types.js";
import { isDecimal, shiftPoint, signOf } from "../decimal.js";

export type Direction = "up" | "down" | "flat";

/** Direction of a signed decimal string; invalid input is flat. */
export function directionOf(value: string | undefined): Direction {
  if (!isDecimal(value)) return "flat";
  const sign = signOf(value);
  if (sign > 0) return "up";
  return sign < 0 ? "down" : "flat";
}

export const GLYPH: Record<Direction, string> = { up: "▲", down: "▼", flat: "" };

/** Intl formatting of a decimal string (formatted exactly, not through a float). */
export function formatDecimalString(
  value: string,
  locale: string | undefined,
  options: Intl.NumberFormatOptions,
): string {
  // String input is Intl.NumberFormat v3 (ES2023); the cast bridges our ES2022 typings.
  return new Intl.NumberFormat(locale, options).format(value.trim() as unknown as number);
}

/** Large quantities (volume, open interest) in compact notation: "12.35K". */
export function formatCompact(value: string, locale?: string): string {
  return formatDecimalString(value, locale, { notation: "compact", maximumFractionDigits: 2 });
}

/** A percentage value ("2.345" = 2.345 %) with an explicit sign: "+2.35%". */
export function formatPercent(value: string, locale?: string, digits = 2): string {
  const number = formatDecimalString(value, locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: "exceptZero",
  });
  return `${number}%`;
}

/** A funding-rate fraction ("0.0001") as a signed percentage ("+0.0100%"). */
export function formatFundingRate(rate: string, locale?: string): string {
  return formatPercent(shiftPoint(rate, 2), locale, 4);
}

/** A signed price difference: "+120.50" / "-3.00". */
export function formatSignedPrice(
  value: string,
  market: Pick<MarketSpec, "tickSize" | "pricePrecision">,
  locale?: string,
): string {
  const text = formatPrice(value, market, locale);
  return directionOf(value) === "up" ? `+${text}` : text;
}

/** Milliseconds → "HH:MM:SS", rounded up to the next second and clamped at zero. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

/** Whether the user asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  return (
    typeof globalThis.matchMedia === "function" &&
    globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
