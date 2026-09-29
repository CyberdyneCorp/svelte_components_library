/**
 * Index-based horizontal scale (design D3). Every bar gets one slot of
 * `barSpacing` pixels, so gaps in time (weekends, halts) are skipped.
 *
 * The view is anchored to the right edge: `rightOffset` is the number of bar
 * slots between the last bar and the right edge of the plot. A negative
 * value means the user has scrolled into the past.
 */

export interface TimeScaleOptions {
  barSpacing: number;
  rightOffset: number;
  minBarSpacing: number;
  maxBarSpacing: number;
  /** Bars that must stay visible when panning to either end. */
  minVisibleBars: number;
}

export const DEFAULT_TIME_SCALE: TimeScaleOptions = {
  barSpacing: 8,
  rightOffset: 4,
  minBarSpacing: 0.5,
  maxBarSpacing: 60,
  minVisibleBars: 2,
};

/** Integer bar indices worth drawing, inclusive, with one extra bar either side. */
export interface BarRange {
  first: number;
  last: number;
}

/** Logical (fractional) bar positions at the left and right plot edges. */
export interface LogicalRange {
  from: number;
  to: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class TimeScale {
  readonly options: TimeScaleOptions;
  barSpacing: number;
  rightOffset: number;
  width = 0;
  count = 0;

  constructor(options: Partial<TimeScaleOptions> = {}) {
    this.options = { ...DEFAULT_TIME_SCALE, ...options };
    this.barSpacing = this.options.barSpacing;
    this.rightOffset = this.options.rightOffset;
  }

  /** Centre x of bar `index`. */
  indexToX(index: number): number {
    return this.width - (this.rightOffset + this.count - 1 - index + 0.5) * this.barSpacing;
  }

  /** Fractional bar position under `x`; bar i spans [i - 0.5, i + 0.5). */
  xToLogical(x: number): number {
    return this.rightOffset + this.count - 0.5 - (this.width - x) / this.barSpacing;
  }

  /** Nearest existing bar under `x`, or -1 without data. */
  xToIndex(x: number): number {
    if (this.count === 0) return -1;
    return clamp(Math.round(this.xToLogical(x)), 0, this.count - 1);
  }

  logicalRange(): LogicalRange {
    return { from: this.xToLogical(0), to: this.xToLogical(this.width) };
  }

  /** Bars to draw: the visible ones plus one either side, clamped to the data. */
  visibleBars(): BarRange {
    const { from, to } = this.logicalRange();
    return {
      first: clamp(Math.floor(from) - 1, 0, Math.max(0, this.count - 1)),
      last: clamp(Math.ceil(to) + 1, -1, this.count - 1),
    };
  }

  /** True when the last bar is on screen, so new bars should scroll into view. */
  isAtRightEdge(): boolean {
    return this.rightOffset >= -0.5;
  }

  /**
   * Updates the bar count after bars were appended. When the view is at the
   * right edge it keeps its offset and so follows new bars; otherwise it
   * shifts so the bars on screen stay where they are. `keepPosition: false`
   * keeps the offset from the right edge as is (history prepended, or a new
   * series after `reset`).
   */
  setCount(count: number, keepPosition = true): void {
    const added = count - this.count;
    if (keepPosition && this.count > 0 && added > 0 && !this.isAtRightEdge()) this.rightOffset -= added;
    this.count = count;
    this.constrain();
  }

  setWidth(width: number): void {
    this.width = Math.max(0, width);
    this.constrain();
  }

  /** Drags the content by `dx` pixels (positive moves it right, revealing the past). */
  pan(dx: number): void {
    this.rightOffset -= dx / this.barSpacing;
    this.constrain();
  }

  /** Scrolls the view by whole bars (positive = towards newer bars). */
  panBars(bars: number): void {
    this.rightOffset += bars;
    this.constrain();
  }

  /** Scales `barSpacing` by `factor`, keeping the bar under `anchorX` fixed. */
  zoom(factor: number, anchorX: number): void {
    const anchor = this.xToLogical(anchorX);
    const { minBarSpacing, maxBarSpacing } = this.options;
    this.barSpacing = clamp(this.barSpacing * factor, minBarSpacing, maxBarSpacing);
    this.rightOffset = anchor - this.count + 0.5 + (this.width - anchorX) / this.barSpacing;
    this.constrain();
  }

  /** Back to the default zoom, following the latest bar. */
  reset(): void {
    this.barSpacing = this.options.barSpacing;
    this.rightOffset = this.options.rightOffset;
    this.constrain();
  }

  /** Scrolls so the last bar sits at the default offset, keeping the zoom. */
  scrollToEnd(): void {
    this.rightOffset = this.options.rightOffset;
    this.constrain();
  }

  /** Scrolls the minimum needed so bar `index` is fully on screen. */
  ensureVisible(index: number): void {
    const half = this.barSpacing / 2;
    const x = this.indexToX(index);
    if (x - half < 0) this.pan(half - x);
    else if (x + half > this.width) this.pan(this.width - half - x);
  }

  /** Keeps at least `minVisibleBars` bars on screen. */
  private constrain(): void {
    if (this.width <= 0 || this.count === 0) return;
    const keep = Math.min(this.options.minVisibleBars, this.count);
    const max = this.width / this.barSpacing - keep;
    const min = keep - this.count;
    this.rightOffset = clamp(this.rightOffset, min, Math.max(min, max));
  }
}
