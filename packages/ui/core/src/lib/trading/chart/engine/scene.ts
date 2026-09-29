/** Read-only state the frame builder and painters work from. */
import type { Candle, ChartMarker, MarketSpec, PriceLine } from "../../types.js";
import type { ResolvedLabels } from "../labels.js";
import type { PriceScaleMode, SeriesType, VolumeMode } from "../types.js";
import type { IndicatorStore } from "./indicatorStore.js";
import type { ChartTheme } from "./theme.js";
import type { TimeFormatter } from "./timeLabels.js";

export interface ChartOptions {
  seriesType: SeriesType;
  volume: VolumeMode;
  scaleMode: PriceScaleMode;
  market?: MarketSpec;
  /** IANA zone for time labels; default "UTC". */
  timeZone: string;
  locale?: string;
  labels: ResolvedLabels;
}

export interface Crosshair {
  index: number;
  /** Pointer y, or null for the keyboard crosshair (vertical line only). */
  y: number | null;
  source: "pointer" | "keyboard";
}

/** A marker with its bar index resolved (markers outside the data are dropped). */
export interface IndexedMarker {
  index: number;
  marker: ChartMarker;
}

export interface Scene {
  candles: readonly Candle[];
  options: ChartOptions;
  store: IndicatorStore;
  theme: ChartTheme;
  /** Resolves a consumer colour (var() allowed) against the chart element. */
  color(value: string | undefined, fallback: string): string;
  markers: readonly IndexedMarker[];
  priceLines: readonly PriceLine[];
  /** Price line being dragged and its snapped price. */
  draft: { id: string; price: number } | null;
  /** Id of the draggable price line under the pointer. */
  hoverLine: string | null;
  crosshair: Crosshair | null;
  time: TimeFormatter;
  /** Typical bar duration in ms. */
  interval: number;
  dpr: number;
}

export const VOLUME_PANE = "volume";

/** Id of a price line: its `id`, else its index. */
export const priceLineId = (line: PriceLine, index: number) => line.id ?? `price-line-${index}`;
