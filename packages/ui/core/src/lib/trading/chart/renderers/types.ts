/** Shared inputs of the pure `draw*` renderers (design D3). */

/** The bars to draw and how to place them horizontally. */
export interface BarGeometry {
  /** First and last bar index to draw, inclusive (already clamped to the data). */
  first: number;
  last: number;
  /** Centre x of bar `i` in CSS pixels. */
  x: (i: number) => number;
  /** Width of one bar slot in CSS pixels. */
  spacing: number;
  /** Device pixel ratio, for pixel-aligned strokes. */
  dpr: number;
}

/** Maps a value to a y coordinate in CSS pixels. */
export type YMap = (value: number) => number;

/** Value of bar `i`; NaN leaves a gap. */
export type ValueAt = (i: number) => number;

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Font size used for all chart text, in CSS pixels. */
export const FONT_SIZE = 11;

export const fontOf = (family: string, weight = "") =>
  `${weight ? `${weight} ` : ""}${FONT_SIZE}px ${family}`;

export type LineStyle = "solid" | "dashed" | "dotted";

export function dashFor(style: LineStyle | undefined): number[] {
  if (style === "dashed") return [6, 4];
  if (style === "dotted") return [1, 3];
  return [];
}
