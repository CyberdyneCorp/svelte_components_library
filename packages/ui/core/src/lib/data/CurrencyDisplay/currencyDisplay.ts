/**
 * Pure helpers behind CurrencyDisplay. Amounts stay decimal strings; the
 * actual formatting is delegated to `formatMoney` (Intl with string input).
 */
import { formatMoney, type FormatMoneyOptions } from "../../forms/MoneyInput/money.js";

const AMOUNT_PATTERN = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;

export const INVALID_AMOUNT_TEXT = "—";

/** True for plain decimal strings such as "1234.50", "-7" or ".5". */
export function isValidAmount(amount: unknown): amount is string {
  return typeof amount === "string" && AMOUNT_PATTERN.test(amount.trim());
}

/** True when a valid amount is below zero ("-0.00" is not negative). */
export function isNegativeAmount(amount: string): boolean {
  const trimmed = amount.trim();
  return trimmed.startsWith("-") && /[1-9]/.test(trimmed);
}

/** Formatted text, or `null` when the amount or currency is unusable. */
export function tryFormatAmount(amount: unknown, options: FormatMoneyOptions): string | null {
  if (!isValidAmount(amount)) return null;
  try {
    return formatMoney(amount.trim(), options);
  } catch {
    return null;
  }
}

/**
 * Width stand-in for a masked value: every digit becomes "0". With tabular
 * numerals all digits share one advance width, so the box keeps the width of
 * the real value while the real digits never reach the DOM.
 */
export function maskSizer(formatted: string): string {
  return formatted.replace(/\d/g, "0");
}

/** Mask glyphs shown over the sizer, one per digit (at least four). */
export function maskGlyphs(formatted: string, glyph = "•"): string {
  const digits = formatted.replace(/\D/g, "").length;
  return glyph.repeat(Math.max(4, digits));
}
