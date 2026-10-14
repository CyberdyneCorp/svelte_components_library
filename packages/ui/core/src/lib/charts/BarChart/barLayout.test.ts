import { describe, it, expect } from "vitest";
import { dataMatrix, layoutBars, rectMarker, seriesMatrix, type BarRect } from "./barLayout.js";

const plot = { left: 50, top: 20, width: 500, height: 200 };

const usage = seriesMatrix([
  { name: "Compute", data: [{ label: "Jan", value: 10 }, { label: "Feb", value: 20 }] },
  { name: "Storage", data: [{ label: "Jan", value: 5 }, { label: "Feb", value: 5 }] },
]);

describe("seriesMatrix", () => {
  it("orders categories by first appearance and fills gaps with 0", () => {
    const m = seriesMatrix([
      { name: "A", data: [{ label: "x", value: 1 }, { label: "y", value: 2 }] },
      { name: "B", data: [{ label: "z", value: 3 }, { label: "y", value: 4 }] },
    ]);
    expect(m.categories).toEqual(["x", "y", "z"]);
    expect(m.values).toEqual([[1, 2, 0], [0, 4, 3]]);
  });

  it("wraps flat data as one series", () => {
    expect(dataMatrix([{ label: "a", value: 1 }])).toEqual({ categories: ["a"], values: [[1]] });
  });
});

describe("layoutBars", () => {
  it("scales stacked bars to the largest category total", () => {
    const layout = layoutBars({ ...usage, colors: ["#a", "#b"], stacked: true, plot });
    expect(layout.max).toBe(25);
    expect(layout.rects).toHaveLength(4);
    const feb = layout.rects.filter((r) => r.categoryIndex === 1);
    // Compute sits on the baseline, Storage directly on top of it.
    expect(feb[0].y + feb[0].height).toBeCloseTo(plot.top + plot.height);
    expect(feb[1].y + feb[1].height).toBeCloseTo(feb[0].y);
    expect(feb[0].height + feb[1].height).toBeCloseTo(plot.height);
    expect(feb[0].x).toBe(feb[1].x);
  });

  it("labels each stack with its total", () => {
    const layout = layoutBars({ ...usage, colors: ["#a", "#b"], stacked: true, plot });
    expect(layout.valueLabels.map((l) => l.text)).toEqual(["15", "25"]);
  });

  it("places grouped bars side by side within a band, scaled to the largest value", () => {
    const layout = layoutBars({ ...usage, colors: ["#a", "#b"], plot });
    expect(layout.max).toBe(20);
    const jan = layout.rects.filter((r) => r.categoryIndex === 0);
    expect(jan[1].x).toBeCloseTo(jan[0].x + jan[0].width);
    expect(jan[0].width).toBeCloseTo(jan[1].width);
    expect(layout.valueLabels).toHaveLength(4);
  });

  it("stacks along x when horizontal", () => {
    const layout = layoutBars({ ...usage, colors: ["#a", "#b"], stacked: true, horizontal: true, plot });
    const jan = layout.rects.filter((r) => r.categoryIndex === 0);
    expect(jan[0].x).toBe(plot.left);
    expect(jan[1].x).toBeCloseTo(jan[0].x + jan[0].width);
    expect(jan[0].y).toBe(jan[1].y);
    expect(layout.axes).toHaveLength(1);
    expect(layout.categoryLabels[0].anchor).toBe("end");
    expect(layout.valueLabels[0].anchor).toBe("start");
  });

  it("draws negative values as 0 when stacked", () => {
    const m = seriesMatrix([
      { name: "A", data: [{ label: "x", value: 4 }] },
      { name: "B", data: [{ label: "x", value: -3 }] },
    ]);
    const layout = layoutBars({ ...m, colors: ["#a", "#b"], stacked: true, plot });
    expect(layout.max).toBe(4);
    expect(layout.rects[1].height).toBe(0);
    expect(layout.rects[1].value).toBe(-3);
  });

  it("colours per category for single-series data", () => {
    const layout = layoutBars({ ...dataMatrix([{ label: "a", value: 1 }, { label: "b", value: 2 }]), colors: ["#1", "#2"], perCategoryColors: true, plot });
    expect(layout.rects.map((r) => r.color)).toEqual(["#1", "#2"]);
  });

  it("falls back to a unit scale for empty or all-zero data", () => {
    expect(layoutBars({ categories: [], values: [[]], colors: [], plot }).max).toBe(1);
    expect(layoutBars({ ...dataMatrix([{ label: "a", value: 0 }]), colors: ["#1"], plot }).max).toBe(1);
  });

  it("emits one more tick than intervals, from 0 to max", () => {
    const layout = layoutBars({ ...usage, colors: ["#a", "#b"], stacked: true, plot });
    expect(layout.ticks.map((t) => t.label.text)).toEqual(["0", "6.25", "12.50", "18.75", "25"]);
  });
});

describe("rectMarker", () => {
  const rect = (width: number, height: number): BarRect => ({ x: 0, y: 0, width, height, color: "", seriesIndex: 0, categoryIndex: 0, value: 1 });

  it("centres a marker in a bar large enough to hold it", () => {
    expect(rectMarker(rect(40, 20))).toEqual({ cx: 20, cy: 10, size: 10 });
  });

  it("skips bars thinner than the minimum extent", () => {
    expect(rectMarker(rect(40, 9))).toBeNull();
  });
});
