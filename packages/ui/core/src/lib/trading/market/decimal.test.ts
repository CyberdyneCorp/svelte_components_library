import { describe, it, expect } from "vitest";
import {
  commonScale,
  compare,
  isDecimal,
  isMultipleOf,
  multiply,
  scaleOf,
  shiftPoint,
  signOf,
  subtract,
} from "./decimal.js";

describe("decimal helpers", () => {
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
    expect(subtract("0.3", "0.1")).toBe("0.2");
    expect(subtract("100", "100.5")).toBe("-0.5");
    expect(compare("1.10", "1.1")).toBe(0);
    expect(compare("2", "10")).toBe(-1);
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
    expect(multiply("0.01", 10)).toBe("0.10");
  });

  it("shifts the decimal point", () => {
    expect(shiftPoint("0.0001", 2)).toBe("0.01");
    expect(shiftPoint("-0.000125", 2)).toBe("-0.0125");
    expect(shiftPoint("0.5", 2)).toBe("50");
    expect(shiftPoint("3", 2)).toBe("300");
  });
});
