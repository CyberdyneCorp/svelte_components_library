/**
 * Custom (non-ISO) asset support shared by MoneyInput and CurrencyDisplay.
 * Setting `decimals` switches to asset mode: `currency` is then any asset
 * code ("USDC", "ETH") and amounts use exactly `decimals` fraction digits.
 * Amounts stay decimal strings; Intl formats them from the string, so no
 * value ever goes through a JS `number`.
 */
import { currencyMinorUnits, formatMoney, type FormatMoneyOptions } from "./money.js";

/** Largest fraction-digit count Intl.NumberFormat accepts. */
export const MAX_ASSET_DECIMALS = 100;

export interface AmountFormatOptions extends FormatMoneyOptions {
  /** Fraction digits of a custom asset (USDC 6, BTC 8, ETH 18). */
  decimals?: number;
  /**
   * Asset mode only: fewest fraction digits to display (0–`decimals`). Below
   * `decimals` it drops trailing zeros down to this many ("2 ETH", "0.00067 ETH");
   * defaults to `decimals`, so amounts keep a fixed width.
   */
  minDecimals?: number;
  /** Optional asset symbol ("₿", "Ξ") placed where the locale puts currency symbols. */
  symbol?: string;
}

export type AssetFormatOptions = AmountFormatOptions & { decimals: number };

export function isAssetOptions(options: AmountFormatOptions): options is AssetFormatOptions {
  return options.decimals !== undefined;
}

/** Validated asset precision (integer 0–100, non-empty code); throws otherwise. */
function assetDecimals(options: AssetFormatOptions): number {
  const { decimals } = options;
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > MAX_ASSET_DECIMALS) {
    throw new RangeError(`Invalid asset decimals: ${decimals}`);
  }
  if (options.currency.trim() === "") throw new RangeError("Missing asset code");
  return decimals;
}

/** Validated lower fraction-digit bound (integer 0–`decimals`, default `decimals`); throws otherwise. */
function assetMinDecimals(options: AssetFormatOptions, decimals: number): number {
  const { minDecimals } = options;
  if (minDecimals === undefined) return decimals;
  if (!Number.isInteger(minDecimals) || minDecimals < 0 || minDecimals > decimals) {
    throw new RangeError(`Invalid asset minDecimals: ${minDecimals}`);
  }
  return minDecimals;
}

/**
 * Fraction digits for parsing, clamping and rounding: the asset's `decimals`
 * in asset mode, the ISO currency's minor units otherwise. Throws on invalid
 * decimals, an empty asset code or an unknown ISO code. `minDecimals` only
 * affects display, never the precision an amount is parsed or rounded to.
 */
export function resolveMinorUnits(options: AmountFormatOptions): number {
  return isAssetOptions(options)
    ? assetDecimals(options)
    : currencyMinorUnits(options.currency, options.locale);
}

/** Intl options that round like the displayed amount (asset digits or currency style). */
export function amountRounding(options: AmountFormatOptions): Intl.NumberFormatOptions {
  if (!isAssetOptions(options)) return { style: "currency", currency: options.currency };
  const digits = assetDecimals(options);
  return {
    minimumFractionDigits: assetMinDecimals(options, digits),
    maximumFractionDigits: digits,
  };
}

/** The symbol to place like a currency symbol, or null to append the code. */
function assetSymbol(options: AssetFormatOptions): string | null {
  const symbol = options.symbol?.trim();
  const wantsCode = options.currencyDisplay === "code" || options.currencyDisplay === "name";
  return !wantsCode && symbol ? symbol : null;
}

/**
 * Locale formatting of a custom asset amount with exactly `decimals` fraction
 * digits (half-expand rounding, as Intl does for currencies), or between
 * `minDecimals` and `decimals` digits when `minDecimals` is set. The code is
 * appended after the number with a no-break space ("1.234,5678 ETH") in every
 * locale; a `symbol` instead takes the locale's currency-symbol position
 * ("₿1.00" en-US, "1,00 ₿" de-DE), borrowed from the ISO "no currency" XXX.
 */
export function formatAsset(value: string, options: AssetFormatOptions): string {
  const { locale, signDisplay } = options;
  // String input and signDisplay "negative" are NumberFormat v3 (ES2023);
  // the casts only bridge our ES2022 lib typings. Strings format exactly.
  const base = { signDisplay, ...amountRounding(options) } as Intl.NumberFormatOptions;
  const input = value as unknown as number;
  const symbol = assetSymbol(options);
  if (symbol === null) {
    return `${new Intl.NumberFormat(locale, base).format(input)}\u00a0${options.currency.trim()}`;
  }
  return new Intl.NumberFormat(locale, { ...base, style: "currency", currency: "XXX" })
    .formatToParts(input)
    .map((part) => (part.type === "currency" ? symbol : part.value))
    .join("");
}

/** `formatAsset` in asset mode, `formatMoney` (ISO currency style) otherwise. */
export function formatAmount(value: string, options: AmountFormatOptions): string {
  if (isAssetOptions(options)) return formatAsset(value, options);
  const { currency, locale, currencyDisplay, signDisplay } = options;
  return formatMoney(value, { currency, locale, currencyDisplay, signDisplay });
}
