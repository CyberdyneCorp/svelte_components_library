import { describe, it, expect } from "vitest";
import { budgetRatio, budgetState, computeBudget, toBudgetAmount } from "./budget.js";

const thresholds = [0.8, 1] as const;

describe("budget helpers", () => {
  it("parses valid amounts and falls back to zero for invalid ones", () => {
    expect(toBudgetAmount(" 820.5 ", 2)).toEqual({ value: "820.5", minor: BigInt(82050) });
    expect(toBudgetAmount("abc", 2)).toEqual({ value: "0", minor: BigInt(0) });
    expect(toBudgetAmount(undefined, 2)).toEqual({ value: "0", minor: BigInt(0) });
  });

  it("never divides by a zero or negative limit", () => {
    expect(budgetRatio(BigInt(100), BigInt(0))).toBe(Infinity);
    expect(budgetRatio(BigInt(0), BigInt(0))).toBe(0);
    expect(budgetRatio(BigInt(-5), BigInt(0))).toBe(0);
    expect(budgetRatio(BigInt(-50), BigInt(100))).toBe(0);
  });

  it.each([
    [0, "ok"],
    [0.79, "ok"],
    [0.8, "approaching"],
    [1, "approaching"],
    [1.0001, "exceeded"],
    [Infinity, "exceeded"],
  ] as const)("ratio %s is %s", (ratio, state) => {
    expect(budgetState(ratio, thresholds)).toBe(state);
  });

  it("honours custom thresholds", () => {
    expect(budgetState(0.5, [0.5, 0.9])).toBe("approaching");
    expect(budgetState(0.95, [0.5, 0.9])).toBe("exceeded");
  });

  it("computes overage exactly with BigInt", () => {
    const m = computeBudget({ spent: "12345678901234.57", limit: "12345678901234.56" }, 2, thresholds);
    expect(m.overage).toBe("0.01");
    expect(m.state).toBe("exceeded");
    expect(m.spentPercent).toBe(100);
  });

  it("stacks committed after spent within 100%", () => {
    const m = computeBudget({ spent: "700", limit: "1000", committed: "500" }, 2, thresholds);
    expect(m.spentPercent).toBeCloseTo(70);
    expect(m.committedPercent).toBeCloseTo(30);
    expect(m.state).toBe("ok");
  });

  it("treats limit 0 with spending as exceeded and without spending as ok", () => {
    expect(computeBudget({ spent: "10", limit: "0" }, 2, thresholds)).toMatchObject({
      state: "exceeded",
      spentPercent: 100,
      overage: "10.00",
    });
    expect(computeBudget({ spent: "0", limit: "0" }, 2, thresholds)).toMatchObject({
      state: "ok",
      spentPercent: 0,
      overage: null,
    });
  });
});
