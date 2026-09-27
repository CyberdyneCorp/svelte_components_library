import type { ChartMarkerShape } from "./markers.js";

export type ChartLegendItem = {
  label: string;
  color: string;
  /** Shape of the swatch; use the same shape for the series' plot marks. */
  marker?: ChartMarkerShape;
  /** Dash pattern of the series line, drawn as a line sample when `showLine`. */
  dash?: string;
  /** Optional secondary text, e.g. a percentage. */
  detail?: string;
};
