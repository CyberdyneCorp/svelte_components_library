/**
 * Framework-free chart engine (design D3). Owns the data, scales, indicator
 * values and the two canvas layers; `TradingChart.svelte` feeds it props and
 * `interaction.ts` feeds it pointer and keyboard input. Every change marks a
 * layer dirty and the scheduler paints at most once per animation frame.
 */
import type { Candle, ChartMarker, PriceLine } from "../../types.js";
import { defaultResolver, type BindingResolver } from "../indicatorBindings.js";
import { resolveLabels } from "../labels.js";
import type { CrosshairInfo, IndicatorConfig, VisibleRange } from "../types.js";
import { buildFrame, type Frame } from "./frame.js";
import { hitTest, snapPrice, type Hit } from "./hitTest.js";
import { IndicatorStore } from "./indicatorStore.js";
import { dragSeparator, paneAt, type ChartLayout } from "./layout.js";
import { paintMain } from "./paintMain.js";
import { paintOverlay } from "./paintOverlay.js";
import { findPriceLine, nextDraggable, nudgedPrice, type PriceLineEdit } from "./priceLineEditor.js";
import { createScheduler, type FrameClock, type Layer, type Scheduler } from "./scheduler.js";
import { classifyChange, indexAtTime, snapshotOf, type SeriesSnapshot } from "./series.js";
import type { ChartOptions, Crosshair, IndexedMarker, Scene } from "./scene.js";
import { beginFrame, sizeCanvas, type Size } from "./surface.js";
import { readTheme, resolveColor, type ChartTheme } from "./theme.js";
import { inferInterval, TimeFormatter, ZoneClock } from "./timeLabels.js";
import { TimeScale } from "./timeScale.js";
import { fontOf } from "../renderers/types.js";

export interface EngineCallbacks {
  onrangechange?(range: VisibleRange): void;
  oncrosshairmove?(info: CrosshairInfo | null): void;
  onpricelinechange?(id: string, price: number): void;
  /** A keyboard price-line edit step (select, move, commit, cancel), for announcements. */
  onpricelineedit?(edit: PriceLineEdit): void;
  /** Pane heights in px after a separator drag, keyed by pane id. */
  onpaneheightschange?(heights: Record<string, number>): void;
  /** Candles or indicator values changed (refreshes the data table). */
  ondatachange?(): void;
  /** An indicator threw (invalid parameters or data) and was disabled. */
  onindicatorerror?(config: IndicatorConfig, error: Error): void;
}

export interface EngineDeps {
  resolver?: BindingResolver;
  clock?: FrameClock;
  readTheme?: (element: Element) => ChartTheme;
}

const MIN_AXIS_WIDTH = 48;

export const DEFAULT_OPTIONS: ChartOptions = {
  seriesType: "candles",
  volume: "overlay",
  scaleMode: "linear",
  timeZone: "UTC",
  labels: resolveLabels(),
};

export class ChartEngine {
  readonly timeScale = new TimeScale();
  readonly store: IndicatorStore;
  private readonly scheduler: Scheduler;
  private readonly mainCtx: CanvasRenderingContext2D | null;
  private readonly overlayCtx: CanvasRenderingContext2D | null;
  private readonly readTheme: (element: Element) => ChartTheme;
  private candles: readonly Candle[] = [];
  private snapshot: SeriesSnapshot | null = null;
  private options: ChartOptions = DEFAULT_OPTIONS;
  private indicators: readonly IndicatorConfig[] = [];
  private rawMarkers: readonly ChartMarker[] = [];
  private markers: IndexedMarker[] = [];
  private priceLines: readonly PriceLine[] = [];
  private ratios: Record<string, number> = {};
  private theme: ChartTheme;
  private readonly colors = new Map<string, string>();
  private size: Size = { width: 0, height: 0 };
  private dpr = 1;
  private priceAxisWidth = 64;
  private crosshair: Crosshair | null = null;
  private draft: { id: string; price: number } | null = null;
  /** True while `draft` comes from the keyboard rather than a pointer drag. */
  private keyEdit = false;
  private hoverLine: string | null = null;
  private separatorDrag: { index: number; layout: ChartLayout } | null = null;
  private frame: Frame | null = null;
  private interval = 60_000;
  private time = new TimeFormatter("UTC");
  private clock = new ZoneClock("UTC");
  private rangeKey = "";

  constructor(
    private readonly host: HTMLElement,
    private readonly mainCanvas: HTMLCanvasElement,
    private readonly overlayCanvas: HTMLCanvasElement,
    private readonly callbacks: EngineCallbacks = {},
    deps: EngineDeps = {},
  ) {
    this.store = new IndicatorStore(deps.resolver ?? defaultResolver, callbacks.onindicatorerror);
    this.readTheme = deps.readTheme ?? readTheme;
    this.theme = this.readTheme(host);
    this.mainCtx = mainCanvas.getContext("2d");
    this.overlayCtx = overlayCanvas.getContext("2d");
    this.scheduler = createScheduler((main, overlay) => this.draw(main, overlay), deps.clock);
  }

  // ── Data and options ─────────────────────────────────────────────

  setCandles(candles: readonly Candle[]): void {
    const change = classifyChange(this.snapshot, candles);
    const prevLast = this.snapshot?.lastTime;
    this.candles = candles;
    this.snapshot = snapshotOf(candles);
    if (change.kind === "reset") {
      this.interval = inferInterval((i) => candles[i].time, candles.length);
      // A new series resets the view; prepended history keeps it.
      if (prevLast === undefined || prevLast !== this.snapshot?.lastTime) this.timeScale.reset();
      this.timeScale.setCount(candles.length, false);
    } else {
      this.timeScale.setCount(candles.length);
    }
    this.store.apply(change, candles);
    if (change.kind !== "update") this.indexMarkers();
    this.clampCrosshair();
    this.callbacks.ondatachange?.();
    this.invalidate();
  }

  setOptions(options: Partial<ChartOptions>): void {
    const next = { ...this.options, ...options };
    if (next.timeZone !== this.options.timeZone || next.locale !== this.options.locale) {
      this.time = new TimeFormatter(next.timeZone, next.locale);
      this.clock = new ZoneClock(next.timeZone);
    }
    const relabel = next.labels !== this.options.labels;
    this.options = next;
    if (relabel) this.setIndicators(this.indicators);
    this.invalidate();
  }

  setIndicators(configs: readonly IndicatorConfig[]): void {
    this.indicators = configs;
    this.store.configure(configs, this.options.labels, this.candles);
    this.callbacks.ondatachange?.();
    this.invalidate();
  }

  setMarkers(markers: readonly ChartMarker[]): void {
    this.rawMarkers = markers;
    this.indexMarkers();
    this.invalidate("main");
  }

  setPriceLines(lines: readonly PriceLine[]): void {
    this.priceLines = lines;
    if (this.draft && !findPriceLine(lines, this.draft.id)) this.stopEdit();
    this.invalidate("main");
  }

  /** Relative pane heights keyed by pane id (e.g. `{ main: 3, rsi: 1 }`). */
  setPaneHeights(ratios: Readonly<Record<string, number>>): void {
    this.ratios = { ...ratios };
    this.invalidate();
  }

  resize(size: Size, dpr: number): void {
    this.size = size;
    this.dpr = dpr;
    sizeCanvas(this.mainCanvas, size, dpr);
    sizeCanvas(this.overlayCanvas, size, dpr);
    this.invalidate();
    this.scheduler.flush();
  }

  /** Re-reads the token colours (theme switch). */
  refreshTheme(): void {
    this.theme = this.readTheme(this.host);
    this.colors.clear();
    this.invalidate();
  }

  destroy(): void {
    this.scheduler.dispose();
  }

  /** Paints pending layers now (tests, resize). */
  flush(): void {
    this.scheduler.flush();
  }

  // ── Queries ──────────────────────────────────────────────────────

  get data(): readonly Candle[] {
    return this.candles;
  }

  get barInterval(): number {
    return this.interval;
  }

  get currentFrame(): Frame {
    this.frame ??= this.buildFrame();
    return this.frame;
  }

  get currentCrosshair(): Crosshair | null {
    return this.crosshair;
  }

  visibleRange(): VisibleRange | null {
    const count = this.candles.length;
    if (count === 0 || this.timeScale.width <= 0) return null;
    const { from, to } = this.timeScale.logicalRange();
    const first = Math.min(count - 1, Math.max(0, Math.ceil(from - 0.5)));
    const last = Math.max(first, Math.min(count - 1, Math.floor(to + 0.5)));
    return { from: first, to: last, fromTime: this.candles[first].time, toTime: this.candles[last].time };
  }

  hitTest(x: number, y: number): Hit {
    return hitTest(this.currentFrame, this.scene(), x, y);
  }

  // ── Navigation ───────────────────────────────────────────────────

  panBy(dx: number): void {
    this.timeScale.pan(dx);
    this.invalidate();
  }

  panBars(bars: number): void {
    this.timeScale.panBars(bars);
    this.invalidate();
  }

  zoomAt(factor: number, x: number): void {
    this.timeScale.zoom(factor, x);
    this.invalidate();
  }

  /** Zooms around the crosshair, else the latest bar when following, else the centre. */
  zoomBy(factor: number): void {
    const ts = this.timeScale;
    let anchor = ts.width / 2;
    if (this.crosshair) anchor = ts.indexToX(this.crosshair.index);
    else if (ts.isAtRightEdge()) anchor = ts.indexToX(ts.count - 1);
    this.zoomAt(factor, anchor);
  }

  resetView(): void {
    this.timeScale.reset();
    this.invalidate();
  }

  // ── Crosshair ────────────────────────────────────────────────────

  pointerAt(x: number, y: number): void {
    const frame = this.currentFrame;
    const inside = x >= 0 && x <= frame.layout.plotWidth && y >= 0 && y < frame.layout.timeAxis.top;
    const next: Crosshair | null =
      inside && this.candles.length > 0 ? { index: this.timeScale.xToIndex(x), y, source: "pointer" } : null;
    this.setCrosshair(next);
  }

  pointerLeave(): void {
    if (this.crosshair?.source === "pointer") this.setCrosshair(null);
  }

  /**
   * Moves the keyboard crosshair by `delta` bars, scrolling it into view.
   * Without a crosshair it starts from the last visible bar (the bar the
   * legend shows).
   */
  moveCrosshair(delta: number): void {
    const count = this.candles.length;
    if (count === 0) return;
    const start = this.crosshair?.index ?? this.visibleRange()?.to ?? count - 1;
    this.focusBar(Math.min(count - 1, Math.max(0, start + delta)));
  }

  /** Jumps the keyboard crosshair to the first or last bar. */
  crosshairTo(edge: "first" | "last"): void {
    const count = this.candles.length;
    if (count === 0) return;
    if (edge === "last") this.timeScale.scrollToEnd();
    this.focusBar(edge === "first" ? 0 : count - 1);
  }

  clearCrosshair(): void {
    this.setCrosshair(null);
  }

  private focusBar(index: number): void {
    this.timeScale.ensureVisible(index);
    this.setCrosshair({ index, y: null, source: "keyboard" });
    this.invalidate();
  }

  private setCrosshair(next: Crosshair | null): void {
    const prev = this.crosshair;
    this.crosshair = next;
    this.invalidate("overlay");
    if (prev?.index === next?.index && prev?.y === next?.y) return;
    this.callbacks.oncrosshairmove?.(next ? this.crosshairInfo(next) : null);
  }

  private crosshairInfo(crosshair: Crosshair): CrosshairInfo {
    const main = this.currentFrame.panes[0];
    const pane = crosshair.y === null ? undefined : paneAt(this.currentFrame.layout, crosshair.y);
    const values: Record<string, number | null> = {};
    for (const series of this.store.allSeries()) {
      const value = series.values[crosshair.index];
      values[series.header] = Number.isFinite(value) ? value : null;
    }
    return {
      index: crosshair.index,
      time: this.candles[crosshair.index].time,
      candle: this.candles[crosshair.index],
      price: pane?.id === main.id && crosshair.y !== null ? main.scale.yToPrice(crosshair.y) : undefined,
      values,
      source: crosshair.source,
    };
  }

  private clampCrosshair(): void {
    if (!this.crosshair) return;
    if (this.candles.length === 0) this.crosshair = null;
    else this.crosshair.index = Math.min(this.crosshair.index, this.candles.length - 1);
  }

  // ── Dragging separators and price lines ──────────────────────────

  beginSeparatorDrag(index: number): void {
    this.separatorDrag = { index, layout: this.currentFrame.layout };
  }

  /** `dy` is the total pointer movement since the drag started. */
  dragSeparator(dy: number): void {
    if (!this.separatorDrag) return;
    this.ratios = dragSeparator(this.separatorDrag.layout, this.separatorDrag.index, dy);
    this.invalidate();
  }

  endSeparatorDrag(): void {
    if (!this.separatorDrag) return;
    this.separatorDrag = null;
    this.callbacks.onpaneheightschange?.({ ...this.ratios });
  }

  setHoverLine(id: string | null): void {
    if (this.hoverLine === id) return;
    this.hoverLine = id;
    this.invalidate("main");
  }

  beginPriceLineDrag(id: string): void {
    const line = findPriceLine(this.priceLines, id);
    if (!line) return;
    this.keyEdit = false;
    this.draft = { id, price: line.price };
  }

  /** Moves the dragged line to the tick-snapped price under `y`. */
  dragPriceLine(y: number): void {
    if (!this.draft) return;
    const main = this.currentFrame.panes[0];
    this.draft = { id: this.draft.id, price: snapPrice(main.scale.yToPrice(y), this.options.market) };
    this.invalidate("main");
  }

  /** Ends the drag and reports the snapped price through `onpricelinechange`. */
  endPriceLineDrag(): void {
    const draft = this.draft;
    this.draft = null;
    this.invalidate("main");
    if (draft) this.callbacks.onpricelinechange?.(draft.id, draft.price);
  }

  get dragging(): boolean {
    return (this.draft !== null && !this.keyEdit) || this.separatorDrag !== null;
  }

  // ── Keyboard price-line editing ──────────────────────────────────

  /** The line being edited from the keyboard and its draft price. */
  get editingPriceLine(): { id: string; price: number } | null {
    return this.keyEdit ? this.draft : null;
  }

  get hasDraggablePriceLines(): boolean {
    return this.priceLines.some((line) => line.draggable);
  }

  /** Selects the next (1) or previous (−1) draggable line for editing; a pending move is dropped. */
  selectPriceLine(step: 1 | -1): void {
    const id = nextDraggable(this.priceLines, this.editingPriceLine?.id ?? null, step);
    const line = id === null ? undefined : findPriceLine(this.priceLines, id);
    if (!id || !line) return;
    this.keyEdit = true;
    this.draft = { id, price: line.price };
    this.invalidate("main");
    this.emitEdit("select", line.price);
  }

  /** Moves the edited line by `ticks` market ticks (tick-snapped). */
  nudgePriceLine(ticks: number): void {
    const edit = this.editingPriceLine;
    if (!edit) return;
    this.draft = { id: edit.id, price: nudgedPrice(edit.price, ticks, this.options.market) };
    this.invalidate("main");
    this.emitEdit("move", this.draft.price);
  }

  /** Ends the keyboard edit and reports the draft price through `onpricelinechange`. */
  commitPriceLine(): void {
    const edit = this.editingPriceLine;
    if (!edit) return;
    this.emitEdit("commit", edit.price);
    this.stopEdit();
    this.callbacks.onpricelinechange?.(edit.id, edit.price);
  }

  /** Ends the keyboard edit, leaving the line at its current price. */
  cancelPriceLine(): void {
    const edit = this.editingPriceLine;
    if (!edit) return;
    const line = findPriceLine(this.priceLines, edit.id);
    if (line) this.emitEdit("cancel", line.price);
    this.stopEdit();
  }

  private stopEdit(): void {
    this.draft = null;
    this.keyEdit = false;
    this.invalidate("main");
  }

  private emitEdit(phase: PriceLineEdit["phase"], price: number): void {
    const id = this.draft?.id;
    const line = id === undefined ? undefined : findPriceLine(this.priceLines, id);
    if (id !== undefined && line) this.callbacks.onpricelineedit?.({ phase, id, price, line });
  }

  // ── Painting ─────────────────────────────────────────────────────

  invalidate(layer: Layer | "all" = "all"): void {
    if (layer !== "overlay") this.frame = null;
    this.scheduler.invalidate(layer);
  }

  private scene(): Scene {
    return {
      candles: this.candles,
      options: this.options,
      store: this.store,
      theme: this.theme,
      color: (value, fallback) => this.resolveColor(value, fallback),
      markers: this.markers,
      priceLines: this.priceLines,
      draft: this.draft,
      hoverLine: this.hoverLine,
      crosshair: this.crosshair,
      time: this.time,
      interval: this.interval,
      dpr: this.dpr,
    };
  }

  private buildFrame(): Frame {
    return buildFrame({
      scene: this.scene(),
      timeScale: this.timeScale,
      width: this.size.width,
      height: this.size.height,
      priceAxisWidth: this.priceAxisWidth,
      ratios: this.ratios,
      clock: this.clock,
    });
  }

  private draw(main: boolean, overlay: boolean): void {
    if (this.size.width <= 0 || this.size.height <= 0) return;
    if (main) this.fitAxisWidth();
    const frame = this.currentFrame;
    const scene = this.scene();
    if (main && this.mainCtx) {
      beginFrame(this.mainCtx, this.dpr);
      paintMain(this.mainCtx, frame, scene);
    }
    if (overlay && this.overlayCtx) {
      beginFrame(this.overlayCtx, this.dpr);
      paintOverlay(this.overlayCtx, frame, scene);
    }
    this.emitRange();
  }

  /** Sizes the price axis to its longest label before painting (rebuilding the frame if it changed). */
  private fitAxisWidth(): void {
    const ctx = this.mainCtx;
    if (!ctx) return;
    ctx.font = fontOf(this.theme.font);
    const lastClose = this.candles[this.candles.length - 1]?.close ?? 0;
    let widest = 0;
    for (const pane of this.currentFrame.panes) {
      for (const value of [pane.scale.min, pane.scale.max, lastClose]) {
        widest = Math.max(widest, ctx.measureText(pane.format(value)).width);
      }
    }
    const width = Math.max(MIN_AXIS_WIDTH, Math.ceil((widest + 14) / 4) * 4);
    if (width !== this.priceAxisWidth) {
      this.priceAxisWidth = width;
      this.frame = null;
    }
  }

  private emitRange(): void {
    const range = this.visibleRange();
    const key = range ? `${range.from}:${range.to}:${range.fromTime}:${range.toTime}` : "";
    if (key === this.rangeKey) return;
    this.rangeKey = key;
    if (range) this.callbacks.onrangechange?.(range);
  }

  private resolveColor(value: string | undefined, fallback: string): string {
    if (!value) return fallback;
    let resolved = this.colors.get(value);
    if (resolved === undefined) {
      resolved = resolveColor(this.host, value, "");
      this.colors.set(value, resolved);
    }
    return resolved || fallback;
  }

  private indexMarkers(): void {
    this.markers = [];
    for (const marker of this.rawMarkers) {
      const index = indexAtTime(this.candles, marker.time);
      if (index >= 0) this.markers.push({ index, marker });
    }
  }
}
