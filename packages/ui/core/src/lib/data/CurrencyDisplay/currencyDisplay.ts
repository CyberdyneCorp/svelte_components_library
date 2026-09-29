/**
 * Pure helpers behind CurrencyDisplay. Amounts stay decimal strings; ISO
 * currencies are formatted by `formatMoney`, custom assets (crypto tokens) by
 * `formatAsset`. Both use Intl with string input, so no amount ever goes
 * through a JS `number`.
 */
import { formatMoney, type FormatMoneyOptions } from "../../forms/MoneyInput/money.js";

const AMOUNT_PATTERN = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;
/** Any decimal digit, including native digits such as Arabic-Indic or Devanagari. */
const DIGIT = /\p{Nd}/gu;
/** Largest fraction-digit count Intl.NumberFormat accepts. */
export const MAX_ASSET_DECIMALS = 100;

export const INVALID_AMOUNT_TEXT = "—";

/**
 * Formatting options. Setting `decimals` switches to asset mode: `currency`
 * is then any asset code ("ETH", "USDC") instead of an ISO 4217 code.
 */
export interface AmountFormatOptions extends FormatMoneyOptions {
  /** Fraction digits of a custom asset (USDC 6, BTC 8, ETH 18). */
  decimals?: number;
  /** Optional asset symbol ("₿", "Ξ") placed where the locale puts currency symbols. */
  symbol?: string;
}

export type AssetFormatOptions = AmountFormatOptions & { decimals: number };

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

function isAsset(options: AmountFormatOptions): options is AssetFormatOptions {
  return options.decimals !== undefined;
}

function fractionDigits(decimals: number): Intl.NumberFormatOptions {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > MAX_ASSET_DECIMALS) {
    throw new RangeError(`Invalid asset decimals: ${decimals}`);
  }
  return { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
}

/** The symbol to place like a currency symbol, or null to append the code. */
function assetSymbol(options: AssetFormatOptions): string | null {
  const symbol = options.symbol?.trim();
  const wantsCode = options.currencyDisplay === "code" || options.currencyDisplay === "name";
  return !wantsCode && symbol ? symbol : null;
}

/**
 * Locale formatting of a custom asset amount with exactly `decimals` fraction
 * digits (half-expand rounding, as Intl does for currencies). The code is
 * appended after the number with a no-break space ("1.234,5678 ETH") in every
 * locale; a `symbol` instead takes the locale's currency-symbol position
 * ("₿1.00" en-US, "1,00 ₿" de-DE), borrowed from the ISO "no currency" XXX.
 */
export function formatAsset(value: string, options: AssetFormatOptions): string {
  const { locale, signDisplay, decimals } = options;
  const code = options.currency.trim();
  if (code === "") throw new RangeError("Missing asset code");
  // String input and signDisplay "negative" are NumberFormat v3 (ES2023);
  // the casts only bridge our ES2022 lib typings. Strings format exactly.
  const base = { signDisplay, ...fractionDigits(decimals) } as Intl.NumberFormatOptions;
  const input = value as unknown as number;
  const symbol = assetSymbol(options);
  if (symbol === null) {
    return `${new Intl.NumberFormat(locale, base).format(input)}\u00a0${code}`;
  }
  return new Intl.NumberFormat(locale, { ...base, style: "currency", currency: "XXX" })
    .formatToParts(input)
    .map((part) => (part.type === "currency" ? symbol : part.value))
    .join("");
}

function signProbe(options: AmountFormatOptions): Intl.NumberFormat {
  const { locale, currency } = options;
  const rounding: Intl.NumberFormatOptions = isAsset(options)
    ? fractionDigits(options.decimals)
    : { style: "currency", currency };
  // "exceptZero" marks only values that stay non-zero after rounding, so
  // "-0.00" and "-0.001" (USD) count as zero, exactly as they are displayed.
  return new Intl.NumberFormat(locale, {
    ...rounding,
    signDisplay: "exceptZero",
  } as Intl.NumberFormatOptions);
}

/** Sign of the amount as displayed after rounding (throws on an unknown currency/locale). */
export function displayedSign(amount: string, options: AmountFormatOptions): AmountSign {
  const types = signProbe(options)
    .formatToParts(amount as unknown as number)
    .map((part) => part.type);
  if (types.includes("minusSign")) return -1;
  return types.includes("plusSign") ? 1 : 0;
}

function zeroDigitOf(options: AmountFormatOptions): string {
  const integer = signProbe(options)
    .formatToParts(0)
    .find((part) => part.type === "integer");
  return integer?.value ?? "0";
}

/**
 * Formatted text plus its displayed sign, or `null` when the amount,
 * currency or asset decimals are unusable. Amounts that display as zero are
 * formatted without a minus sign, so "-0.00" never renders as "-$0.00".
 */
export function tryFormatAmount(
  amount: unknown,
  options: AmountFormatOptions,
): FormattedAmount | null {
  if (!isValidAmount(amount)) return null;
  const trimmed = amount.trim();
  try {
    const sign = displayedSign(trimmed, options);
    const value = sign === 0 ? trimmed.replace(/^-/, "") : trimmed;
    const text = isAsset(options) ? formatAsset(value, options) : formatMoney(value, options);
    return { text, sign, zeroDigit: zeroDigitOf(options) };
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
