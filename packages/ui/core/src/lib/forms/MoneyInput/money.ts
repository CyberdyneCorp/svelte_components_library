/**
 * Money helpers built on decimal strings and BigInt minor units.
 * Nothing here converts an amount to a JS `number`, so values of any
 * magnitude round-trip exactly (e.g. "12345678901234.56").
 */

const DECIMAL_PATTERN = /^(-)?(\d*)(?:\.(\d*))?$/;

export interface FormatMoneyOptions {
  currency: string;
  locale?: string;
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
  signDisplay?: "auto" | "always" | "exceptZero" | "negative" | "never";
}

/** Number of fraction digits the currency uses (USD 2, JPY 0, BHD 3). */
export function currencyMinorUnits(currency: string, locale?: string): number {
  const options = new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions();
  return options.maximumFractionDigits ?? 2;
}

/** Scaled integer amount → canonical decimal string ("-5.00"). */
export function fromMinorUnits(amount: bigint, minorUnits: number): string {
  const negative = amount < BigInt(0);
  const digits = (negative ? -amount : amount).toString().padStart(minorUnits + 1, "0");
  const splitAt = digits.length - minorUnits;
  const body = minorUnits > 0 ? `${digits.slice(0, splitAt)}.${digits.slice(splitAt)}` : digits;
  return negative ? `-${body}` : body;
}

/**
 * Decimal string ("1234.5", "-7", "10.") → scaled integer amount.
 * Extra fraction digits are truncated. Throws on anything else.
 */
export function toMinorUnits(value: string, minorUnits: number): bigint {
  const match = DECIMAL_PATTERN.exec(value.trim());
  if (!match || (match[2] === "" && !match[3])) {
    throw new RangeError(`Invalid decimal amount: "${value}"`);
  }
  const [, sign, int, frac = ""] = match;
  const scaled = BigInt((int || "0") + frac.slice(0, minorUnits).padEnd(minorUnits, "0"));
  return sign ? -scaled : scaled;
}

/** Sign of `a - b` for two decimal strings. */
export function compareMoney(a: string, b: string, minorUnits: number): number {
  const diff = toMinorUnits(a, minorUnits) - toMinorUnits(b, minorUnits);
  if (diff === BigInt(0)) return 0;
  return diff > BigInt(0) ? 1 : -1;
}

/** Clamps a canonical amount to the optional decimal-string bounds. */
export function clampMoney(value: string, minorUnits: number, min?: string, max?: string): string {
  if (min != null && compareMoney(value, min, minorUnits) < 0) {
    return fromMinorUnits(toMinorUnits(min, minorUnits), minorUnits);
  }
  if (max != null && compareMoney(value, max, minorUnits) > 0) {
    return fromMinorUnits(toMinorUnits(max, minorUnits), minorUnits);
  }
  return value;
}

/**
 * Keeps only the characters an amount can contain while typing: digits,
 * `.` and `,`, plus a leading `-` when negatives are allowed.
 */
export function sanitizeMoneyTyping(raw: string, allowNegative = false): string {
  const negative = allowNegative && raw.trimStart().startsWith("-");
  const body = raw.replace(/[^\d.,]/g, "");
  return negative ? `-${body}` : body;
}

/**
 * Splits unsigned typed text into integer and fraction digits. The last
 * `.` or `,` is the decimal separator when no more than `minorUnits` digits
 * follow it; every other separator is grouping and is dropped.
 */
function splitDecimal(body: string, minorUnits: number): { int: string; frac: string } {
  const last = Math.max(body.lastIndexOf("."), body.lastIndexOf(","));
  const tail = last === -1 ? "" : body.slice(last + 1);
  if (last === -1 || tail.length > minorUnits) {
    return { int: body.replace(/[.,]/g, ""), frac: "" };
  }
  return { int: body.slice(0, last).replace(/[.,]/g, ""), frac: tail };
}

/**
 * Typed or pasted text ("1.234,56", "$1,234.5", "12") → canonical decimal
 * string with exactly `minorUnits` fraction digits, or `null` when the
 * text holds no digits.
 */
export function parseMoneyInput(raw: string, minorUnits: number, allowNegative = false): string | null {
  const cleaned = sanitizeMoneyTyping(raw, allowNegative);
  const negative = cleaned.startsWith("-");
  const { int, frac } = splitDecimal(negative ? cleaned.slice(1) : cleaned, minorUnits);
  if (int === "" && frac === "") return null;
  const scaled = BigInt((int || "0") + frac.padEnd(minorUnits, "0"));
  return fromMinorUnits(negative ? -scaled : scaled, minorUnits);
}

/** Locale currency formatting of a decimal string, without float conversion. */
export function formatMoney(value: string, options: FormatMoneyOptions): string {
  const { locale, ...rest } = options;
  // String input and signDisplay "negative" are NumberFormat v3 (ES2023);
  // the casts only bridge our ES2022 lib typings. Strings format exactly.
  const formatter = new Intl.NumberFormat(locale, { style: "currency", ...rest } as Intl.NumberFormatOptions);
  return formatter.format(value as unknown as number);
}

/** Canonical amount → plain editable text using the locale's decimal mark. */
export function toEditableMoney(value: string, locale?: string): string {
  const parts = new Intl.NumberFormat(locale).formatToParts(1.5);
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";
  return value.replace(".", decimal);
}
