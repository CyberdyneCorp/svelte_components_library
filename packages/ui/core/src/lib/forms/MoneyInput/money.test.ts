import { describe, it, expect } from "vitest";
import {
  clampMoney,
  compareMoney,
  currencyMinorUnits,
  formatMoney,
  fromMinorUnits,
  parseMoneyInput,
  sanitizeMoneyTyping,
  toEditableMoney,
  toMinorUnits,
} from "./money";

describe("currencyMinorUnits", () => {
  it("reads fraction digits from Intl", () => {
    expect(currencyMinorUnits("USD", "en-US")).toBe(2);
    expect(currencyMinorUnits("JPY", "ja-JP")).toBe(0);
    expect(currencyMinorUnits("BHD", "en-US")).toBe(3);
  });
});

describe("toMinorUnits / fromMinorUnits", () => {
  it("round-trips a 16-digit amount exactly", () => {
    const scaled = toMinorUnits("12345678901234.56", 2);
    expect(scaled).toBe(BigInt("1234567890123456"));
    expect(fromMinorUnits(scaled, 2)).toBe("12345678901234.56");
  });

  it("pads short fractions and truncates long ones", () => {
    expect(toMinorUnits("10.5", 2)).toBe(BigInt(1050));
    expect(toMinorUnits("10.", 2)).toBe(BigInt(1000));
    expect(toMinorUnits(".5", 2)).toBe(BigInt(50));
    expect(toMinorUnits("1.239", 2)).toBe(BigInt(123));
  });

  it("handles negatives and sub-unit amounts", () => {
    expect(toMinorUnits("-5", 2)).toBe(BigInt(-500));
    expect(fromMinorUnits(BigInt(-500), 2)).toBe("-5.00");
    expect(fromMinorUnits(BigInt(7), 2)).toBe("0.07");
    expect(fromMinorUnits(BigInt(-7), 3)).toBe("-0.007");
  });

  it("omits the decimal point for zero minor units", () => {
    expect(fromMinorUnits(BigInt(1500), 0)).toBe("1500");
    expect(toMinorUnits("1500", 0)).toBe(BigInt(1500));
  });

  it("rejects non-decimal strings", () => {
    expect(() => toMinorUnits("abc", 2)).toThrow(RangeError);
    expect(() => toMinorUnits("", 2)).toThrow(RangeError);
    expect(() => toMinorUnits("1e5", 2)).toThrow(RangeError);
    expect(() => toMinorUnits("-", 2)).toThrow(RangeError);
  });
});

describe("compareMoney / clampMoney", () => {
  it("compares across different scales without floats", () => {
    expect(compareMoney("10", "10.00", 2)).toBe(0);
    expect(compareMoney("0.10", "0.09", 2)).toBe(1);
    expect(compareMoney("-1", "0", 2)).toBe(-1);
    expect(compareMoney("90071992547409.93", "90071992547409.92", 2)).toBe(1);
  });

  it("clamps to canonical bounds", () => {
    expect(clampMoney("5.00", 2, "10")).toBe("10.00");
    expect(clampMoney("500.00", 2, undefined, "99.9")).toBe("99.90");
    expect(clampMoney("50.00", 2, "10", "99.9")).toBe("50.00");
  });
});

describe("sanitizeMoneyTyping", () => {
  it("keeps digits and separators only", () => {
    expect(sanitizeMoneyTyping("$1,234.5a")).toBe("1,234.5");
  });

  it("keeps a leading minus only when allowed", () => {
    expect(sanitizeMoneyTyping("-12", true)).toBe("-12");
    expect(sanitizeMoneyTyping("-12", false)).toBe("12");
    expect(sanitizeMoneyTyping("1-2", true)).toBe("12");
  });
});

describe("parseMoneyInput", () => {
  it("returns null when there are no digits", () => {
    expect(parseMoneyInput("", 2)).toBeNull();
    expect(parseMoneyInput("abc", 2)).toBeNull();
    expect(parseMoneyInput("-", 2, true)).toBeNull();
  });

  it("treats the last separator as decimal when ≤ minor-unit digits follow", () => {
    expect(parseMoneyInput("1,234.56", 2)).toBe("1234.56");
    expect(parseMoneyInput("1.234,56", 2)).toBe("1234.56");
    expect(parseMoneyInput("12,5", 2)).toBe("12.50");
    expect(parseMoneyInput("12.", 2)).toBe("12.00");
  });

  it("treats the last separator as grouping when more digits follow", () => {
    expect(parseMoneyInput("1,234", 2)).toBe("1234.00");
    expect(parseMoneyInput("1.234.567", 2)).toBe("1234567.00");
  });

  it("treats every separator as grouping for zero-minor-unit currencies", () => {
    expect(parseMoneyInput("1,500", 0)).toBe("1500");
    expect(parseMoneyInput("1.500", 0)).toBe("1500");
  });

  it("uses three fraction digits for BHD", () => {
    expect(parseMoneyInput("1,234.567", 3)).toBe("1234.567");
    expect(parseMoneyInput("1,5", 3)).toBe("1.500");
  });

  it("round-trips the precision fixture", () => {
    expect(parseMoneyInput("12345678901234.56", 2)).toBe("12345678901234.56");
    expect(parseMoneyInput("12,345,678,901,234.56", 2)).toBe("12345678901234.56");
  });

  it("normalizes leading zeros and negative zero", () => {
    expect(parseMoneyInput("007", 2)).toBe("7.00");
    expect(parseMoneyInput("-0", 2, true)).toBe("0.00");
    expect(parseMoneyInput("-12,5", 2, true)).toBe("-12.50");
    expect(parseMoneyInput("-12,5", 2, false)).toBe("12.50");
  });
});

describe("formatMoney / toEditableMoney", () => {
  it("formats decimal strings exactly per locale", () => {
    expect(formatMoney("12345678901234.56", { currency: "USD", locale: "en-US" })).toBe(
      "$12,345,678,901,234.56",
    );
    expect(formatMoney("1234.50", { currency: "EUR", locale: "de-DE" })).toBe("1.234,50 €");
    expect(formatMoney("1500", { currency: "JPY", locale: "en-US" })).toBe("¥1,500");
  });

  it("passes currencyDisplay and signDisplay through", () => {
    expect(formatMoney("5.00", { currency: "USD", locale: "en-US", currencyDisplay: "code", signDisplay: "always" })).toBe(
      "+USD 5.00",
    );
  });

  it("uses the locale decimal mark for editing", () => {
    expect(toEditableMoney("1234.56", "de-DE")).toBe("1234,56");
    expect(toEditableMoney("1234.56", "en-US")).toBe("1234.56");
    expect(toEditableMoney("1500", "ja-JP")).toBe("1500");
  });
});
