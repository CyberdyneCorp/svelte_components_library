import { describe, expect, it } from "vitest";
import { computeLayout, dragSeparator, hitSeparator, MIN_PANE_HEIGHT, paneAt, ratioOf } from "./layout.js";

const base = { width: 900, height: 524, priceAxisWidth: 60, timeAxisHeight: 24 };

describe("layout", () => {
  it("gives the main pane three shares and sub-panes one by default", () => {
    const layout = computeLayout({ ...base, paneIds: ["main", "rsi"], ratios: {} });
    expect(layout.plotWidth).toBe(840);
    expect(layout.panes.map((p) => [p.id, p.top, p.height])).toEqual([
      ["main", 0, 375],
      ["rsi", 375, 125],
    ]);
    expect(layout.separators).toEqual([375]);
    expect(layout.priceAxis).toEqual({ left: 840, top: 0, width: 60, height: 500 });
    expect(layout.timeAxis).toEqual({ left: 0, top: 500, width: 840, height: 24 });
  });

  it("honours custom ratios and ignores invalid ones", () => {
    const layout = computeLayout({ ...base, paneIds: ["main", "rsi", "macd"], ratios: { main: 2, rsi: 1, macd: 1 } });
    expect(layout.panes.map((p) => p.height)).toEqual([250, 125, 125]);
    expect(ratioOf({ rsi: -1 }, "rsi", 1)).toBe(1);
    expect(ratioOf({ main: NaN }, "main", 0)).toBe(3);
  });

  it("uses the whole plot for a single pane and never goes negative", () => {
    expect(computeLayout({ ...base, paneIds: ["main"], ratios: {} }).panes[0].height).toBe(500);
    const tiny = computeLayout({ ...base, width: 10, height: 10, paneIds: ["main"], ratios: {} });
    expect(tiny.plotWidth).toBe(0);
    expect(tiny.panes[0].height).toBe(0);
  });

  it("hit-tests separators within 4px inside the plot", () => {
    const layout = computeLayout({ ...base, paneIds: ["main", "rsi"], ratios: {} });
    expect(hitSeparator(layout, 100, 377)).toBe(0);
    expect(hitSeparator(layout, 100, 380)).toBe(-1);
    expect(hitSeparator(layout, 850, 375)).toBe(-1);
  });

  it("finds the pane under a y", () => {
    const layout = computeLayout({ ...base, paneIds: ["main", "rsi"], ratios: {} });
    expect(paneAt(layout, 10)?.id).toBe("main");
    expect(paneAt(layout, 400)?.id).toBe("rsi");
    expect(paneAt(layout, 510)).toBeUndefined();
  });

  it("resizes the panes on both sides of a dragged separator", () => {
    const layout = computeLayout({ ...base, paneIds: ["main", "rsi", "macd"], ratios: {} });
    const [main, rsi, macd] = layout.panes.map((p) => p.height);
    const heights = dragSeparator(layout, 0, 50);
    expect(heights).toEqual({ main: main + 50, rsi: rsi - 50, macd });
  });

  it("keeps both panes at least the minimum height", () => {
    const layout = computeLayout({ ...base, paneIds: ["main", "rsi"], ratios: {} });
    expect(dragSeparator(layout, 0, 10_000).rsi).toBe(MIN_PANE_HEIGHT);
    expect(dragSeparator(layout, 0, -10_000).main).toBe(MIN_PANE_HEIGHT);
    expect(dragSeparator(layout, 5, 10)).toEqual({ main: 375, rsi: 125 });
  });
});
