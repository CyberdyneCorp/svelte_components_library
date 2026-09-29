import { describe, expect, it } from "vitest";
import {
  addDecimal,
  commonScale,
  compareDecimal,
  divideDecimal,
  divideRounded,
  isDecimal,
  isMultipleOf,
  multiplyByInteger,
  multiplyDecimal,
  scaleOf,
  shiftPoint,
  signOf,
  subtractDecimal,
  trimDecimal,
} from "./decimal.js";

describe("decimal helpers", () => {
  it.each([
    ["12", true],
    ["-0.5", true],
    [".25", true],
    ["10.", true],
    ["", false],
    ["1e3", false],
    ["1,5", false],
    [12, false],
    [null, false],
  ])("isDecimal(%o) → %s", (value, expected) => {
    expect(isDecimal(value)).toBe(expected);
  });

  it.each([
    ["1", "1.000", 0],
    ["64000", "63999.9", 1],
    ["-1", "0", -1],
    ["0.30000000000000004", "0.3", 1],
  ])("compareDecimal(%s, %s) → %i", (a, b, expected) => {
    expect(compareDecimal(a, b)).toBe(expected);
  });

  it("signOf", () => {
    expect(signOf("-0.001")).toBe(-1);
    expect(signOf("0.000")).toBe(0);
    expect(signOf("5")).toBe(1);
  });

  it("adds, subtracts and multiplies exactly", () => {
    expect(addDecimal("0.1", "0.2")).toBe("0.3");
    expect(subtractDecimal("1", "1.25")).toBe("-0.25");
    expect(multiplyDecimal("0.1", "3")).toBe("0.3");
    expect(multiplyDecimal("0.015", "64000")).toBe("960.000");
    expect(multiplyDecimal("-2.5", "0.0004")).toBe("-0.00100");
    expect(multiplyDecimal("123456789012345678.9", "10")).toBe("1234567890123456789.0");
  });

  it.each([
    ["1000", "64000", 6, "down", "0.015625"],
    ["1", "3", 4, "down", "0.3333"],
    ["2", "3", 4, "nearest", "0.6667"],
    ["1", "3", 2, "up", "0.34"],
    ["-1", "3", 2, "down", "-0.34"],
    ["1", "-4", 2, "down", "-0.25"],
    ["960", "20", 2, "up", "48.00"],
    ["0.5", "0.25", 0, "down", "2"],
  ] as const)("divideDecimal(%s, %s, %i, %s) → %s", (a, b, digits, mode, expected) => {
    expect(divideDecimal(a, b, digits, mode)).toBe(expected);
  });

  it("rejects bad input", () => {
    expect(() => divideDecimal("1", "0", 2)).toThrow(RangeError);
    expect(() => divideDecimal("1", "2", -1)).toThrow(RangeError);
    expect(() => divideDecimal("1", "2", 1.5)).toThrow(RangeError);
    expect(() => addDecimal("abc", "1")).toThrow(RangeError);
    expect(() => divideRounded(BigInt(1), BigInt(2), "sideways" as never)).toThrow(RangeError);
  });

  it.each([
    ["0.0150", "0.015"],
    ["64000.0", "64000"],
    ["100", "100"],
    ["-0.000", "0"],
    ["-1.50", "-1.5"],
  ])("trimDecimal(%s) → %s", (value, expected) => {
    expect(trimDecimal(value)).toBe(expected);
  });
});

describe("fixed-scale helpers", () => {
  it("validates decimal strings", () => {
    expect(isDecimal("1")).toBe(true);
    expect(isDecimal("-0.5")).toBe(true);
    expect(isDecimal(".25")).toBe(true);
    expect(isDecimal("1e5")).toBe(false);
    expect(isDecimal(1)).toBe(false);
  });

  it("measures scale", () => {
    expect(scaleOf("1.50")).toBe(2);
    expect(scaleOf(" 3 ")).toBe(0);
    expect(commonScale(["1", "0.001", "2.5"])).toBe(3);
    expect(commonScale([])).toBe(0);
  });

  it("subtracts and compares exactly", () => {
    expect(subtractDecimal("0.3", "0.1")).toBe("0.2");
    expect(subtractDecimal("100", "100.5")).toBe("-0.5");
    expect(compareDecimal("1.10", "1.1")).toBe(0);
    expect(compareDecimal("2", "10")).toBe(-1);
    expect(signOf("-0.0001")).toBe(-1);
    expect(signOf("0.000")).toBe(0);
  });

  it("checks multiples", () => {
    expect(isMultipleOf("1", "0.5")).toBe(true);
    expect(isMultipleOf("0.75", "0.5")).toBe(false);
    expect(isMultipleOf("0", "0.5")).toBe(false);
    expect(isMultipleOf("1", "0")).toBe(false);
    expect(isMultipleOf("a", "1")).toBe(false);
  });

  it("multiplies a step", () => {
    expect(multiplyByInteger("0.01", 10)).toBe("0.10");
  });

  it("shifts the decimal point", () => {
    expect(shiftPoint("0.0001", 2)).toBe("0.01");
    expect(shiftPoint("-0.000125", 2)).toBe("-0.0125");
    expect(shiftPoint("0.5", 2)).toBe("50");
    expect(shiftPoint("3", 2)).toBe("300");
  });
});
