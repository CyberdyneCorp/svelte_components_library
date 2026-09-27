/**
 * Non-colour series encodings shared by chart plot marks and `ChartLegend`.
 *
 * Each shape is defined once as a polygon in a unit square so the SVG plot
 * marks (`markerPath`) and the HTML legend swatches (`markerClipPath`) draw
 * exactly the same outline — a series stays identifiable in grayscale.
 */

export type ChartMarkerShape =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "triangle-down"
  | "cross";

export type ChartSeriesStyle = {
  marker: ChartMarkerShape;
  /** SVG `stroke-dasharray` value; empty string means a solid line. */
  dash: string;
};

type Point = readonly [number, number];

const POLYGONS: Record<Exclude<ChartMarkerShape, "circle">, readonly Point[]> = {
  square: [[0.1, 0.1], [0.9, 0.1], [0.9, 0.9], [0.1, 0.9]],
  triangle: [[0.5, 0.02], [0.98, 0.9], [0.02, 0.9]],
  diamond: [[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]],
  "triangle-down": [[0.02, 0.1], [0.98, 0.1], [0.5, 0.98]],
  cross: [
    [0.32, 0], [0.68, 0], [0.68, 0.32], [1, 0.32], [1, 0.68], [0.68, 0.68],
    [0.68, 1], [0.32, 1], [0.32, 0.68], [0, 0.68], [0, 0.32], [0.32, 0.32],
  ],
};

export const CHART_MARKER_SHAPES: readonly ChartMarkerShape[] = [
  "circle",
  "square",
  "triangle",
  "diamond",
  "triangle-down",
  "cross",
];

/** Dash patterns, one per marker slot; the first series stays solid. */
export const CHART_DASH_PATTERNS: readonly string[] = ["", "6 4", "2 3", "8 3 2 3", "12 4", "4 2 1 2"];

/** Marker shape and dash pattern for the series at `index` (cycles). */
export function seriesStyle(index: number): ChartSeriesStyle {
  const slot = index % CHART_MARKER_SHAPES.length;
  return { marker: CHART_MARKER_SHAPES[slot], dash: CHART_DASH_PATTERNS[slot] };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** SVG path `d` for a marker centred on (cx, cy) fitting a `size` square. */
export function markerPath(shape: ChartMarkerShape, cx: number, cy: number, size: number): string {
  if (shape === "circle") {
    const r = size / 2;
    return `M${round(cx - r)},${round(cy)} a${r},${r} 0 1,0 ${size},0 a${r},${r} 0 1,0 ${-size},0 Z`;
  }
  const points = POLYGONS[shape].map(
    ([x, y]) => `${round(cx + (x - 0.5) * size)},${round(cy + (y - 0.5) * size)}`,
  );
  return `M${points.join(" L")} Z`;
}

/** CSS `clip-path` that cuts an element's box into the marker shape. */
export function markerClipPath(shape: ChartMarkerShape): string {
  if (shape === "circle") return "circle(50%)";
  const points = POLYGONS[shape].map(([x, y]) => `${round(x * 100)}% ${round(y * 100)}%`);
  return `polygon(${points.join(", ")})`;
}
