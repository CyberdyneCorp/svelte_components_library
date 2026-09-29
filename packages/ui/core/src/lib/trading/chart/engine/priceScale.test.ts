import { describe, expect, it } from "vitest";
import { emptyExtent, hasExtent, includeValue, PriceScale } from "./priceScale.js";
import { linearTicks, logTicks, niceStep, stepDecimals } from "./ticks.js";

describe("ticks", () => {
  it("picks 1 / 2 / 2.5 / 5 × 10^k steps", () => {
    expect(niceStep(0.7)).toBe(1);
    expect(niceStep(1.3)).toBe(2);
    expect(niceStep(2.2)).toBe(2.5);
    expect(niceStep(3)).toBe(5);
    expect(niceStep(7)).toBe(10);
    expect(niceStep(0.03)).toBeCloseTo(0.05);
    expect(niceStep(0)).toBe(1);
    expect(niceStep(NaN)).toBe(1);
  });

  it("knows how many decimals a step needs", () => {
    expect(stepDecimals(1)).toBe(0);
    expect(stepDecimals(25)).toBe(0);
    expect(stepDecimals(0.5)).toBe(1);
    expect(stepDecimals(2.5)).toBe(1);
    expect(stepDecimals(0.25)).toBe(2);
    expect(stepDecimals(0.001)).toBe(3);
    expect(stepDecimals(0)).toBe(0);
  });

  it("generates round ticks without float noise", () => {
    expect(linearTicks(0.1, 0.95, 5)).toEqual([0.2, 0.4, 0.6, 0.8]);
    expect(linearTicks(63_912, 64_188, 6)).toEqual([63_950, 64_000, 64_050, 64_100, 64_150]);
    expect(linearTicks(5, 5, 5)).toEqual([]);
    expect(linearTicks(0, 1, 0)).toEqual([]);
  });

  it("uses 1-2-5 per decade on a wide log range and linear ticks on a narrow one", () => {
    expect(logTicks(1, 1000, 12)).toEqual([1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]);
    expect(logTicks(1, 1e6, 4)).toEqual([1, 100, 10_000, 1_000_000]);
    expect(logTicks(100, 150, 5)).toEqual(linearTicks(100, 150, 5));
    expect(logTicks(0, 10, 5)).toEqual([]);
  });
});

describe("extent", () => {
  it("ignores non-finite values", () => {
    const e = emptyExtent();
    expect(hasExtent(e)).toBe(false);
    for (const v of [3, NaN, -1, Infinity, 7]) includeValue(e, v);
    expect(e).toEqual({ min: -1, max: 7 });
  });
});

describe("PriceScale", () => {
  it("fits the extent inside the margins", () => {
    const s = new PriceScale("linear", 0.1, 0.1);
    s.setBounds(0, 100);
    s.fit({ min: 100, max: 200 });
    expect(s.priceToY(200)).toBeCloseTo(10);
    expect(s.priceToY(100)).toBeCloseTo(90);
    expect(s.yToPrice(50)).toBeCloseTo(150);
  });

  it("offsets by the pane top", () => {
    const s = new PriceScale("linear", 0, 0);
    s.setBounds(300, 100);
    s.fit({ min: 0, max: 10 });
    expect(s.priceToY(10)).toBe(300);
    expect(s.priceToY(0)).toBe(400);
  });

  it("widens a flat or empty extent", () => {
    const s = new PriceScale();
    s.setBounds(0, 100);
    s.fit({ min: 50, max: 50 });
    expect(s.max).toBeGreaterThan(50);
    expect(s.min).toBeLessThan(50);
    s.fit(emptyExtent());
    expect(s.min).toBe(0);
    expect(s.max).toBe(1);
  });

  it("maps a log scale so equal ratios get equal distances", () => {
    const s = new PriceScale("log", 0, 0);
    s.setBounds(0, 300);
    s.fit({ min: 1, max: 1000 });
    expect(s.priceToY(10) - s.priceToY(100)).toBeCloseTo(s.priceToY(100) - s.priceToY(1000));
    expect(s.yToPrice(s.priceToY(42))).toBeCloseTo(42);
    expect(s.min).toBeCloseTo(1);
  });

  it("handles a flat log extent and non-positive values", () => {
    const s = new PriceScale("log");
    s.setBounds(0, 100);
    s.fit({ min: 5, max: 5 });
    expect(s.max).toBeGreaterThan(5);
    expect(s.min).toBeLessThan(5);
    s.fit({ min: -10, max: 10 });
    expect(s.min).toBeGreaterThan(0);
  });

  it("generates ticks that fit the pane height", () => {
    const s = new PriceScale();
    s.setBounds(0, 320);
    s.fit({ min: 0, max: 100 });
    const ticks = s.ticks(32);
    expect(ticks.length).toBeGreaterThan(3);
    expect(ticks.length).toBeLessThanOrEqual(11);
    const log = new PriceScale("log");
    log.setBounds(0, 320);
    log.fit({ min: 1, max: 10_000 });
    expect(log.ticks()).toContain(100);
  });
});
