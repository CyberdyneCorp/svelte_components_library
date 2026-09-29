import { describe, expect, it } from "vitest";
import { TimeScale } from "./timeScale.js";

function scale(count = 1000, width = 800, barSpacing = 8, rightOffset = 4) {
  const ts = new TimeScale({ barSpacing, rightOffset });
  ts.setWidth(width);
  ts.setCount(count);
  return ts;
}

describe("TimeScale", () => {
  it("places the last bar rightOffset slots from the right edge", () => {
    const ts = scale();
    expect(ts.indexToX(999)).toBe(800 - 4.5 * 8);
    expect(ts.indexToX(998)).toBe(800 - 5.5 * 8);
  });

  it("maps x back to the bar under it", () => {
    const ts = scale();
    for (const i of [900, 950, 999]) {
      expect(ts.xToIndex(ts.indexToX(i))).toBe(i);
      expect(ts.xToIndex(ts.indexToX(i) + 3)).toBe(i);
    }
    expect(ts.xToLogical(ts.indexToX(990))).toBeCloseTo(990);
  });

  it("clamps xToIndex to the data and returns -1 without data", () => {
    const ts = scale();
    expect(ts.xToIndex(10_000)).toBe(999);
    expect(new TimeScale().xToIndex(10)).toBe(-1);
  });

  it("lists only the visible bars plus one either side", () => {
    const ts = scale();
    const { first, last } = ts.visibleBars();
    // 800px / 8px = 100 slots, 4 of them empty on the right.
    expect(last).toBe(999);
    expect(first).toBeGreaterThanOrEqual(999 - 100);
    expect(first).toBeLessThanOrEqual(999 - 94);
    expect(ts.indexToX(first)).toBeLessThan(0 + 8);
  });

  it("pans by pixels: dragging right reveals older bars", () => {
    const ts = scale();
    ts.pan(80);
    expect(ts.rightOffset).toBeCloseTo(4 - 10);
    expect(ts.isAtRightEdge()).toBe(false);
  });

  it("pans by bars towards newer bars", () => {
    const ts = scale();
    ts.panBars(-50);
    ts.panBars(20);
    expect(ts.rightOffset).toBe(4 - 30);
  });

  it("zooms keeping the bar under the anchor fixed", () => {
    const ts = scale();
    const anchorX = ts.indexToX(960);
    ts.zoom(2, anchorX);
    expect(ts.barSpacing).toBe(16);
    expect(ts.indexToX(960)).toBeCloseTo(anchorX);
  });

  it("clamps the bar spacing", () => {
    const ts = scale();
    ts.zoom(1000, 400);
    expect(ts.barSpacing).toBe(ts.options.maxBarSpacing);
    ts.zoom(1e-9, 400);
    expect(ts.barSpacing).toBe(ts.options.minBarSpacing);
  });

  it("keeps some bars visible when panning past either end", () => {
    const ts = scale();
    ts.pan(1e9);
    expect(ts.indexToX(1)).toBeLessThanOrEqual(800);
    ts.pan(-1e9);
    expect(ts.indexToX(998)).toBeGreaterThanOrEqual(0);
  });

  it("follows new bars when at the right edge", () => {
    const ts = scale();
    const before = ts.indexToX(999);
    ts.setCount(1001);
    expect(ts.indexToX(1000)).toBe(before);
  });

  it("does not jump when scrolled 200 bars into the past and a bar is appended", () => {
    const ts = scale();
    ts.panBars(-200);
    const firstBefore = ts.visibleBars().first;
    const xBefore = ts.indexToX(750);
    ts.setCount(1001);
    expect(ts.indexToX(750)).toBe(xBefore);
    expect(ts.visibleBars().first).toBe(firstBefore);
  });

  it("keeps the offset from the right edge when told not to keep the position", () => {
    const ts = scale();
    ts.panBars(-200);
    const offset = ts.rightOffset;
    ts.setCount(2000, false);
    expect(ts.rightOffset).toBe(offset);
  });

  it("scrolls the minimum needed to show a bar", () => {
    const ts = scale();
    ts.ensureVisible(0);
    expect(ts.indexToX(0)).toBeCloseTo(4);
    ts.ensureVisible(999);
    expect(ts.indexToX(999)).toBeCloseTo(796);
    const offset = ts.rightOffset;
    ts.ensureVisible(990);
    expect(ts.rightOffset).toBe(offset);
  });

  it("resets zoom and scroll, and scrolls to the end keeping zoom", () => {
    const ts = scale();
    ts.zoom(2, 400);
    ts.pan(300);
    ts.scrollToEnd();
    expect(ts.barSpacing).toBe(16);
    expect(ts.rightOffset).toBe(4);
    ts.reset();
    expect(ts.barSpacing).toBe(8);
  });
});
