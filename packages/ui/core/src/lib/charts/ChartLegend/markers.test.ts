import { describe, it, expect } from "vitest";
import {
  CHART_DASH_PATTERNS,
  CHART_MARKER_SHAPES,
  markerClipPath,
  markerPath,
  seriesStyle,
} from "./markers.js";

describe("chart markers", () => {
  it("gives each of the first series a distinct shape and dash pattern", () => {
    const styles = CHART_MARKER_SHAPES.map((_, i) => seriesStyle(i));
    expect(new Set(styles.map((s) => s.marker)).size).toBe(CHART_MARKER_SHAPES.length);
    expect(new Set(styles.map((s) => s.dash)).size).toBe(CHART_DASH_PATTERNS.length);
  });

  it("keeps the first series solid and cycles after the last slot", () => {
    expect(seriesStyle(0)).toEqual({ marker: "circle", dash: "" });
    expect(seriesStyle(CHART_MARKER_SHAPES.length)).toEqual(seriesStyle(0));
  });

  it("draws a circle as two arcs around the centre", () => {
    expect(markerPath("circle", 10, 10, 4)).toBe("M8,10 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0 Z");
  });

  it("draws polygons centred on the point", () => {
    expect(markerPath("diamond", 10, 10, 4)).toBe("M10,8 L12,10 L10,12 L8,10 Z");
  });

  it("produces a distinct path per shape", () => {
    const paths = CHART_MARKER_SHAPES.map((shape) => markerPath(shape, 0, 0, 10));
    expect(new Set(paths).size).toBe(CHART_MARKER_SHAPES.length);
  });

  it("maps shapes to the same outline as a CSS clip-path", () => {
    expect(markerClipPath("circle")).toBe("circle(50%)");
    expect(markerClipPath("diamond")).toBe("polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)");
  });
});
