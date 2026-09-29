import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatSize,
  precisionOf,
  pricePrecisionOf,
  roundToStep,
  roundToTick,
  sizePrecisionOf,
} from "./format.js";
import type { MarketSpec } from "./types.js";

const BTC: MarketSpec = {
  symbol: "BTC-PERP",
  baseAsset: "BTC",
  quoteAsset: "USDT",
  tickSize: "0.01",
  stepSize: "0.001",
  minSize: "0.001",
  maxLeverage: 100,
};

describe("precisionOf", () => {
  it.each([
    ["0.5", 1],
    ["0.25", 2],
    ["0.01", 2],
    ["0.010", 2],
    ["0.00000001", 8],
    ["1", 0],
    ["5", 0],
    ["10.0", 0],
    [".1", 1],
  ])("%s → %i", (step, digits) => {
    expect(precisionOf(step)).toBe(digits);
  });

  it.each(["0", "0.000", "-0.5", "", "abc", "1e-8", "0.5.1", "NaN"])("rejects %j", (step) => {
    expect(() => precisionOf(step)).toThrow(RangeError);
  });
});

describe("roundToTick", () => {
  it("rounds to the nearest tick (spec scenario)", () => {
    expect(roundToTick("64123.74", "0.5", "nearest")).toBe("64123.5");
  });

  it("defaults to nearest", () => {
    expect(roundToTick("64123.76", "0.5")).toBe("64124.0");
  });

  it.each([
    ["64123.74", "0.5", "down", "64123.5"],
    ["64123.74", "0.5", "up", "64124.0"],
    ["64123.5", "0.5", "up", "64123.5"],
    ["64123.62", "0.25", "nearest", "64123.50"],
    ["64123.63", "0.25", "nearest", "64123.75"],
    ["64123.63", "0.25", "down", "64123.50"],
    ["64122", "5", "nearest", "64120"],
    ["64123", "5", "nearest", "64125"],
    ["64121", "5", "up", "64125"],
    ["64124.99", "5", "down", "64120"],
    ["0.30000000000000004", "0.01", "nearest", "0.30"],
    ["1.005", "0.01", "nearest", "1.01"],
    ["100", "0.01", "nearest", "100.00"],
    [".26", "0.5", "nearest", "0.5"],
    ["7.", "0.5", "down", "7.0"],
    [" 12.34 ", "0.1", "down", "12.3"],
  ] as const)("%s @ %s %s → %s", (price, tick, mode, expected) => {
    expect(roundToTick(price, tick, mode)).toBe(expected);
  });

  it("keeps arbitrary precision without float drift", () => {
    expect(roundToTick("123456789012345678.123456789", "0.00000001", "down")).toBe(
      "123456789012345678.12345678",
    );
    expect(roundToTick("0.1", "0.00000000000000000001", "nearest")).toBe("0.10000000000000000000");
  });

  describe("ties round half away from zero", () => {
    it.each([
      ["0.25", "0.5", "0.5"],
      ["0.75", "0.5", "1.0"],
      ["-0.25", "0.5", "-0.5"],
      ["-0.75", "0.5", "-1.0"],
      ["2.5", "5", "5"],
      ["-2.5", "5", "-5"],
      ["0.125", "0.25", "0.25"],
    ])("%s @ %s → %s", (price, tick, expected) => {
      expect(roundToTick(price, tick, "nearest")).toBe(expected);
    });
  });

  describe("negative values", () => {
    it("rounds down towards negative infinity and up towards positive infinity", () => {
      expect(roundToTick("-1.26", "0.5", "down")).toBe("-1.5");
      expect(roundToTick("-1.26", "0.5", "up")).toBe("-1.0");
      expect(roundToTick("-1.26", "0.5", "nearest")).toBe("-1.5");
      expect(roundToTick("-1.24", "0.5", "nearest")).toBe("-1.0");
    });

    it("never returns a negative zero", () => {
      expect(roundToTick("-0.2", "0.5", "nearest")).toBe("0.0");
      expect(roundToTick("-0.2", "0.5", "up")).toBe("0.0");
      expect(roundToTick("-0", "1", "down")).toBe("0");
    });
  });

  describe("invalid input", () => {
    it.each(["", "abc", "1e5", "Infinity", "NaN", "1,5", "--1", "-", "."])(
      "throws on price %j",
      (price) => {
        expect(() => roundToTick(price, "0.5")).toThrow(/Invalid price/);
      },
    );

    it.each(["0", "-0.5", "abc", ""])("throws on tick %j", (tick) => {
      expect(() => roundToTick("1", tick)).toThrow(/Invalid step size/);
    });

    it("throws on an unknown mode", () => {
      expect(() => roundToTick("1.3", "0.5", "ceil" as never)).toThrow(/rounding mode/);
    });

    it("throws on a non-string price", () => {
      expect(() => roundToTick(1.3 as unknown as string, "0.5")).toThrow(/Invalid price/);
    });
  });
});

describe("roundToStep", () => {
  it("never rounds a size up by default (spec scenario)", () => {
    expect(roundToStep("0.12399", "0.001", "down")).toBe("0.123");
    expect(roundToStep("0.12399", "0.001")).toBe("0.123");
  });

  it.each([
    ["0.12399", "0.001", "up", "0.124"],
    ["0.12350", "0.001", "nearest", "0.124"],
    ["0.1234", "0.001", "nearest", "0.123"],
    ["3.7", "0.5", "down", "3.5"],
    ["17", "5", "down", "15"],
    ["0.0009", "0.001", "down", "0.000"],
  ] as const)("%s @ %s %s → %s", (size, step, mode, expected) => {
    expect(roundToStep(size, step, mode)).toBe(expected);
  });

  it("rounds a negative size down towards negative infinity", () => {
    expect(roundToStep("-0.12399", "0.001", "down")).toBe("-0.124");
  });

  it("names the size in errors", () => {
    expect(() => roundToStep("x", "0.001")).toThrow(/Invalid size/);
    expect(() => roundToStep("1", "0")).toThrow(/greater than zero/);
  });
});

describe("formatPrice", () => {
  it("derives precision from the tick size (spec scenario)", () => {
    expect(formatPrice(64123.5, BTC, "en-US")).toBe("64,123.50");
  });

  it.each([
    ["0.5", "64,123.5"],
    ["5", "64,124"],
    ["0.0001", "64,123.5000"],
  ])("tick %s → %s", (tickSize, expected) => {
    expect(formatPrice(64123.5, { tickSize }, "en-US")).toBe(expected);
  });

  it("prefers an explicit pricePrecision", () => {
    expect(formatPrice("64123.5", { ...BTC, pricePrecision: 1 }, "en-US")).toBe("64,123.5");
    expect(formatPrice("64123.5", { ...BTC, pricePrecision: 0 }, "en-US")).toBe("64,124");
  });

  it("formats decimal strings exactly, beyond float precision", () => {
    expect(formatPrice("12345678901234567.89", BTC, "en-US")).toBe("12,345,678,901,234,567.89");
  });

  it("uses the locale's separators", () => {
    expect(formatPrice("64123.5", BTC, "de-DE")).toBe("64.123,50");
  });

  it("formats negatives and drops the sign of a rounded zero", () => {
    expect(formatPrice(-1234.5, BTC, "en-US")).toBe("-1,234.50");
    expect(formatPrice("-0.001", BTC, "en-US")).toBe("0.00");
  });

  it("rounds display half away from zero", () => {
    expect(formatPrice("1.005", BTC, "en-US")).toBe("1.01");
    expect(formatPrice("-1.005", BTC, "en-US")).toBe("-1.01");
  });

  it.each([NaN, Infinity, -Infinity])("throws on %s", (value) => {
    expect(() => formatPrice(value, BTC, "en-US")).toThrow(/Invalid price/);
  });

  it("throws on a non-numeric string and an invalid precision", () => {
    expect(() => formatPrice("12abc", BTC, "en-US")).toThrow(/Invalid price/);
    expect(() => formatPrice("1", { ...BTC, pricePrecision: -1 })).toThrow(/price precision/);
    expect(() => formatPrice("1", { ...BTC, pricePrecision: 1.5 })).toThrow(/price precision/);
    expect(() => formatPrice("1", { tickSize: "0" })).toThrow(/step size/);
  });
});

describe("formatSize", () => {
  it("derives precision from the step size", () => {
    expect(formatSize("1.5", BTC, "en-US")).toBe("1.500");
    expect(formatSize(1234, { stepSize: "1" }, "en-US")).toBe("1,234");
  });

  it("prefers an explicit sizePrecision", () => {
    expect(formatSize("0.12345", { ...BTC, sizePrecision: 4 }, "en-US")).toBe("0.1235");
  });

  it("throws on invalid input", () => {
    expect(() => formatSize("", BTC)).toThrow(/Invalid size/);
    expect(() => formatSize("1", { ...BTC, sizePrecision: 101 })).toThrow(/size precision/);
  });
});

describe("precision accessors", () => {
  it("resolve explicit or derived precision", () => {
    expect(pricePrecisionOf(BTC)).toBe(2);
    expect(sizePrecisionOf(BTC)).toBe(3);
    expect(pricePrecisionOf({ ...BTC, pricePrecision: 4 })).toBe(4);
    expect(sizePrecisionOf({ ...BTC, sizePrecision: 0 })).toBe(0);
  });
});
