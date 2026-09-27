/**
 * Pure helpers behind CurrencyDisplay. Amounts stay decimal strings; the
 * actual formatting is delegated to `formatMoney` (Intl with string input).
 */
import { formatMoney, type FormatMoneyOptions } from "../../forms/MoneyInput/money.js";

const AMOUNT_PATTERN = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;
/** Any decimal digit, including native digits such as Arabic-Indic or Devanagari. */
const DIGIT = /\p{Nd}/gu;

export const INVALID_AMOUNT_TEXT = "—";

/** -1 negative, 0 zero, 1 positive — as displayed, after currency rounding. */
export type AmountSign = -1 | 0 | 1;

export interface FormattedAmount {
  text: string;
  sign: AmountSign;
  /** The locale's zero digit ("0", "٠", "०", …), used to build the mask sizer. */
  zeroDigit: string;
}

/** True for plain decimal strings such as "1234.50", "-7" or ".5". */
export function isValidAmount(amount: unknown): amount is string {
  return typeof amount === "string" && AMOUNT_PATTERN.test(amount.trim());
}

function signProbe(options: FormatMoneyOptions): Intl.NumberFormat {
  const { locale, currency } = options;
  // "exceptZero" marks only values that stay non-zero after rounding, so
  // "-0.00" and "-0.001" (USD) count as zero, exactly as they are displayed.
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    signDisplay: "exceptZero",
  } as Intl.NumberFormatOptions);
}

/** Sign of the amount as the currency displays it (throws on an unknown currency/locale). */
export function displayedSign(amount: string, options: FormatMoneyOptions): AmountSign {
  const types = signProbe(options)
    .formatToParts(amount as unknown as number)
    .map((part) => part.type);
  if (types.includes("minusSign")) return -1;
  return types.includes("plusSign") ? 1 : 0;
}

function zeroDigitOf(options: FormatMoneyOptions): string {
  const integer = signProbe(options)
    .formatToParts(0)
    .find((part) => part.type === "integer");
  return integer?.value ?? "0";
}

/**
 * Formatted text plus its displayed sign, or `null` when the amount or
 * currency is unusable. Amounts that display as zero are formatted without a
 * minus sign, so "-0.00" never renders as "-$0.00".
 */
export function tryFormatAmount(
  amount: unknown,
  options: FormatMoneyOptions,
): FormattedAmount | null {
  if (!isValidAmount(amount)) return null;
  const trimmed = amount.trim();
  try {
    const sign = displayedSign(trimmed, options);
    const value = sign === 0 ? trimmed.replace(/^-/, "") : trimmed;
    return { text: formatMoney(value, options), sign, zeroDigit: zeroDigitOf(options) };
  } catch {
    return null;
  }
}

/**
 * Width stand-in for a masked value: every digit becomes the locale's zero.
 * With tabular numerals all digits share one advance width, so the box keeps
 * the width of the real value while the real digits never reach the DOM.
 */
export function maskSizer(formatted: string, zeroDigit = "0"): string {
  return formatted.replace(DIGIT, zeroDigit);
}

/** Mask glyphs shown over the sizer, one per digit (at least four). */
export function maskGlyphs(formatted: string, glyph = "•"): string {
  const digits = formatted.match(DIGIT)?.length ?? 0;
  return glyph.repeat(Math.max(4, digits));
}
