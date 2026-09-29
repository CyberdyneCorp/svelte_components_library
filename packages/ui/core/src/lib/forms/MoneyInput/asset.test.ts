import { describe, it, expect } from "vitest";
import { formatAmount, resolveMinorUnits } from "./asset";
import { exceedsDecimals, parseMoneyInput } from "./money";

const nbsp = (s: string) => s.replace(/\s/g, " ");

describe("resolveMinorUnits", () => {
  it("uses decimals in asset mode for any code", () => {
    expect(resolveMinorUnits({ currency: "USDC", decimals: 6 })).toBe(6);
    expect(resolveMinorUnits({ currency: "ETH", decimals: 18 })).toBe(18);
    expect(resolveMinorUnits({ currency: "USD", decimals: 4 })).toBe(4);
    expect(resolveMinorUnits({ currency: "X", decimals: 0 })).toBe(0);
    expect(resolveMinorUnits({ currency: "X", decimals: 100 })).toBe(100);
  });

  it("keeps ISO minor units without decimals", () => {
    expect(resolveMinorUnits({ currency: "USD" })).toBe(2);
    expect(resolveMinorUnits({ currency: "JPY" })).toBe(0);
    expect(() => resolveMinorUnits({ currency: "USDC" })).toThrow(RangeError);
  });

  it.each([-1, 1.5, 101, Number.NaN])("rejects decimals %s", (decimals) => {
    expect(() => resolveMinorUnits({ currency: "ETH", decimals })).toThrow(RangeError);
  });

  it("rejects an empty asset code", () => {
    expect(() => resolveMinorUnits({ currency: " ", decimals: 6 })).toThrow(RangeError);
  });
});

describe("formatAmount", () => {
  it("formats assets with exactly their decimals and a code suffix", () => {
    expect(nbsp(formatAmount("1234.5", { currency: "USDC", decimals: 6, locale: "en-US" }))).toBe(
      "1,234.500000 USDC",
    );
    expect(nbsp(formatAmount("1234.5", { currency: "USDC", decimals: 6, locale: "pt-BR" }))).toBe(
      "1.234,500000 USDC",
    );
  });

  it("places a symbol like a currency symbol", () => {
    expect(formatAmount("1.5", { currency: "BTC", decimals: 8, symbol: "₿", locale: "en-US" })).toBe(
      "₿1.50000000",
    );
  });

  it("formats 18-decimal values exactly", () => {
    const value = "123456789012345678.123456789012345678";
    expect(nbsp(formatAmount(value, { currency: "ETH", decimals: 18, locale: "en-US" }))).toBe(
      "123,456,789,012,345,678.123456789012345678 ETH",
    );
  });

  it("keeps ISO formatting without decimals", () => {
    expect(formatAmount("1234.5", { currency: "USD", locale: "en-US" })).toBe("$1,234.50");
  });
});

describe("asset parsing", () => {
  it("reads the last separator as decimal up to the asset's decimals", () => {
    expect(parseMoneyInput("1.234", 8)).toBe("1.23400000");
    expect(parseMoneyInput("1,234", 8)).toBe("1.23400000");
    expect(parseMoneyInput("1,234.567891", 6)).toBe("1234.567891");
    expect(parseMoneyInput("1.234,567891", 6)).toBe("1234.567891");
  });

  it("parses 18-decimal values exactly in both locales", () => {
    const exact = "123456789012345678.123456789012345678";
    expect(parseMoneyInput(exact, 18)).toBe(exact);
    expect(parseMoneyInput("123,456,789,012,345,678.123456789012345678", 18)).toBe(exact);
    expect(parseMoneyInput("123.456.789.012.345.678,123456789012345678", 18)).toBe(exact);
  });
});

describe("exceedsDecimals", () => {
  it("flags fractions longer than the decimals", () => {
    expect(exceedsDecimals("1.1234567", 6)).toBe(true);
    expect(exceedsDecimals("0,1234567890123456789", 18)).toBe(true);
    expect(exceedsDecimals("1.2345", 2)).toBe(true);
  });

  it("accepts fractions within the decimals and plain integers", () => {
    expect(exceedsDecimals("1.123456", 6)).toBe(false);
    expect(exceedsDecimals("1.", 6)).toBe(false);
    expect(exceedsDecimals("1234567", 0)).toBe(false);
  });

  it("allows a three-digit thousands group for small decimals", () => {
    expect(exceedsDecimals("1,234", 2)).toBe(false);
    expect(exceedsDecimals("1.000", 0)).toBe(false);
  });
});
