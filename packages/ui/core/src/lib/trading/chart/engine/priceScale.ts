/**
 * Vertical price scale of one pane (design D3): linear or logarithmic,
 * auto-fitted to the visible values with top / bottom margins.
 */
import { linearTicks, logTicks } from "./ticks.js";

export type PriceScaleMode = "linear" | "log";

/** Running min / max accumulator; NaN and ±Infinity values are ignored. */
export interface Extent {
  min: number;
  max: number;
}

export const emptyExtent = (): Extent => ({ min: Infinity, max: -Infinity });

export function includeValue(extent: Extent, value: number): void {
  if (!Number.isFinite(value)) return;
  if (value < extent.min) extent.min = value;
  if (value > extent.max) extent.max = value;
}

export const hasExtent = (extent: Extent) => extent.max >= extent.min;

/** Smallest positive value used for log scales. */
const LOG_FLOOR = 1e-12;

export class PriceScale {
  mode: PriceScaleMode;
  /** Pixel top of the pane. */
  top = 0;
  height = 0;
  /** Fractions of the height kept free above and below the data. */
  marginTop: number;
  marginBottom: number;
  private lo = 0;
  private hi = 1;

  constructor(mode: PriceScaleMode = "linear", marginTop = 0.1, marginBottom = 0.1) {
    this.mode = mode;
    this.marginTop = marginTop;
    this.marginBottom = marginBottom;
  }

  get min(): number {
    return this.fromInternal(this.lo);
  }

  get max(): number {
    return this.fromInternal(this.hi);
  }

  setBounds(top: number, height: number): void {
    this.top = top;
    this.height = Math.max(0, height);
  }

  /** Fits the scale to an extent; an empty or flat extent is widened. */
  fit(extent: Extent): void {
    let { min, max } = hasExtent(extent) ? extent : { min: 0, max: 1 };
    if (this.mode === "log") {
      min = Math.max(min, LOG_FLOOR);
      max = Math.max(max, min);
    }
    if (max === min) {
      const pad = Math.abs(min) * 0.01 || 1;
      max += pad;
      min = this.mode === "log" ? min / (1 + pad / Math.max(min, LOG_FLOOR)) : min - pad;
    }
    this.lo = this.toInternal(min);
    this.hi = this.toInternal(max);
  }

  priceToY(price: number): number {
    const inner = this.innerHeight();
    const t = (this.toInternal(price) - this.lo) / (this.hi - this.lo);
    return this.top + this.height * this.marginTop + (1 - t) * inner;
  }

  yToPrice(y: number): number {
    const inner = this.innerHeight();
    const t = 1 - (y - this.top - this.height * this.marginTop) / (inner || 1);
    return this.fromInternal(this.lo + t * (this.hi - this.lo));
  }

  /** Tick values spaced at least `minSpacing` px apart, within the visible pane. */
  ticks(minSpacing = 32): number[] {
    const count = Math.max(1, Math.floor(this.height / minSpacing));
    const top = this.yToPrice(this.top);
    const bottom = this.yToPrice(this.top + this.height);
    return this.mode === "log" ? logTicks(bottom, top, count) : linearTicks(bottom, top, count);
  }

  private innerHeight(): number {
    return this.height * (1 - this.marginTop - this.marginBottom);
  }

  private toInternal(price: number): number {
    return this.mode === "log" ? Math.log10(Math.max(price, LOG_FLOOR)) : price;
  }

  private fromInternal(value: number): number {
    return this.mode === "log" ? 10 ** value : value;
  }
}
