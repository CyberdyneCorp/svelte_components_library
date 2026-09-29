import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { assigned, callsOf, makeCandles, recordingCanvas, textsOf, type RecordingContext } from "../../../_testdata/canvas.js";
import { fakeBindings } from "../../../_testdata/chartIndicators.js";
import type { MarketSpec } from "../../types.js";
import { resolveLabels } from "../labels.js";
import { ChartEngine, type EngineCallbacks } from "./chartEngine.js";
import { hitPriceLine, snapPrice } from "./hitTest.js";
import type { FrameClock } from "./scheduler.js";
import type { ChartTheme } from "./theme.js";

const market: MarketSpec = {
  symbol: "BTC-PERP",
  baseAsset: "BTC",
  quoteAsset: "USD",
  tickSize: "0.5",
  stepSize: "0.001",
  minSize: "0.001",
  maxLeverage: 50,
};

const theme = (up = "up-1"): ChartTheme => ({
  up,
  down: "down",
  grid: "grid",
  border: "border",
  text: "text",
  textStrong: "strong",
  crosshair: "cross",
  labelBg: "label-bg",
  labelText: "label-text",
  inverseText: "inverse",
  line: "line",
  guide: "guide",
  entry: "entry",
  takeProfit: "tp",
  stopLoss: "sl",
  liquidation: "liq",
  custom: "custom",
  palette: ["p1", "p2", "p3"],
  font: "mono",
});

/** A frame clock that only runs when told to. */
function manualClock() {
  let pending: (() => void) | null = null;
  const clock: FrameClock = {
    request: (cb) => ((pending = cb), 1),
    cancel: () => (pending = null),
  };
  return { clock, tick: () => pending?.() };
}

interface Setup {
  engine: ChartEngine;
  main: RecordingContext;
  overlay: RecordingContext;
  callbacks: Required<Pick<EngineCallbacks, "onrangechange" | "oncrosshairmove" | "onpricelinechange" | "onpaneheightschange" | "ondatachange">>;
  counter: ReturnType<typeof fakeBindings>["counter"];
  setTheme(next: ChartTheme): void;
}

function setup(count = 500): Setup {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const main = recordingCanvas();
  const overlay = recordingCanvas();
  const { resolver, counter } = fakeBindings();
  let current = theme();
  const callbacks = {
    onrangechange: vi.fn(),
    oncrosshairmove: vi.fn(),
    onpricelinechange: vi.fn(),
    onpaneheightschange: vi.fn(),
    ondatachange: vi.fn(),
  };
  const engine = new ChartEngine(host, main.canvas, overlay.canvas, callbacks, {
    resolver,
    clock: manualClock().clock,
    readTheme: () => current,
  });
  engine.setOptions({ market, labels: resolveLabels() });
  engine.setCandles(makeCandles(count));
  engine.resize({ width: 800, height: 400 }, 1);
  return { engine, main: main.ctx, overlay: overlay.ctx, callbacks, counter, setTheme: (t) => (current = t) };
}

let s: Setup;
beforeEach(() => {
  s = setup();
});
afterEach(() => {
  s.engine.destroy();
  document.body.innerHTML = "";
});

describe("ChartEngine painting", () => {
  it("paints both layers on resize, drawing only visible bars", () => {
    const rects = callsOf(s.main, "rect").length;
    const visible = s.engine.visibleRange()!;
    expect(visible.to).toBe(499);
    // Candle bodies + volume columns + clip rect, only for visible bars (±1).
    expect(rects).toBeLessThan((visible.to - visible.from + 3) * 2 + 2);
    expect(rects).toBeGreaterThan(visible.to - visible.from);
    expect(callsOf(s.overlay, "fillText").length).toBeGreaterThan(0);
  });

  it("uses the market precision on the price axis and legend", () => {
    const labels = textsOf(s.main).filter((t) => /^\d/.test(t));
    expect(labels.some((t) => /\.\d$/.test(t))).toBe(true);
    expect(textsOf(s.overlay)).toContain("BTC-PERP");
  });

  it("reports the visible range once per change", () => {
    expect(s.callbacks.onrangechange).toHaveBeenCalledTimes(1);
    const range = s.callbacks.onrangechange.mock.calls[0][0];
    expect(range.to).toBe(499);
    s.engine.flush();
    expect(s.callbacks.onrangechange).toHaveBeenCalledTimes(1);
    s.engine.panBy(200);
    s.engine.flush();
    expect(s.callbacks.onrangechange).toHaveBeenCalledTimes(2);
  });

  it("repaints with new colours when the theme changes", () => {
    s.main.reset();
    s.setTheme(theme("up-2"));
    s.engine.refreshTheme();
    s.engine.flush();
    expect(assigned(s.main, "fillStyle")).toContain("up-2");
    expect(assigned(s.main, "fillStyle")).not.toContain("up-1");
  });

  it("draws line, area and OHLC-bar series", () => {
    for (const seriesType of ["line", "area", "bars", "hollow"] as const) {
      s.main.reset();
      s.engine.setOptions({ seriesType });
      s.engine.flush();
      expect(callsOf(s.main, "stroke").length).toBeGreaterThan(0);
    }
  });

  it("puts volume in its own pane or hides it", () => {
    s.engine.setOptions({ volume: "pane" });
    expect(s.engine.currentFrame.panes.map((p) => p.id)).toEqual(["main", "volume"]);
    s.engine.flush();
    expect(textsOf(s.overlay)).toContain("Volume");
    s.engine.setOptions({ volume: "none" });
    expect(s.engine.currentFrame.volumeScale).toBeNull();
  });

  it("uses a log price scale when asked", () => {
    s.engine.setOptions({ scaleMode: "log" });
    expect(s.engine.currentFrame.panes[0].scale.mode).toBe("log");
  });

  it("draws markers on their bars and price lines with kind colours", () => {
    const candles = s.engine.data;
    s.engine.setMarkers([
      { time: candles[495].time, position: "below", shape: "arrow-up", text: "Long" },
      { time: candles[495].time, position: "below", shape: "circle" },
      { time: candles[496].time, position: "above", shape: "arrow-down", color: "purple" },
      { time: candles[0].time - 1, position: "at", shape: "square" },
    ]);
    s.engine.setPriceLines([
      { price: candles[499].close + 1, kind: "take-profit" },
      { price: candles[499].close - 1, kind: "stop-loss", label: "Stop" },
      { price: candles[499].close, kind: "entry" },
      { price: candles[499].close + 0.5, kind: "liquidation", color: "orange" },
      { price: candles[499].close - 0.5 },
    ]);
    s.main.reset();
    s.engine.flush();
    const texts = textsOf(s.main);
    expect(texts).toContain("Long");
    expect(texts).toContain("TP");
    expect(texts).toContain("Stop");
    expect(texts).toContain("Entry");
    expect(texts).toContain("Liq.");
    const fills = assigned(s.main, "fillStyle");
    for (const colour of ["tp", "sl", "entry", "orange", "purple", "up-1"]) expect(fills).toContain(colour);
  });

  it("draws the last price label off-pane when the last bar is scrolled away", () => {
    s.engine.panBars(-400);
    s.main.reset();
    s.engine.flush();
    expect(callsOf(s.main, "fillRect").length).toBeGreaterThan(0);
  });
});

describe("ChartEngine indicators", () => {
  it("adds sub-panes and overlays, and draws guides", () => {
    s.engine.setIndicators([
      { type: "ema", period: 9 },
      { type: "bollinger", period: 3 },
      { type: "rsi", period: 14 },
      { type: "macd", pane: "macd" },
    ]);
    expect(s.engine.currentFrame.panes.map((p) => p.id)).toEqual(["main", "rsi", "macd"]);
    const rsi = s.engine.currentFrame.panes[1];
    expect(rsi.scale.min).toBeLessThanOrEqual(0);
    s.main.reset();
    s.overlay.reset();
    s.engine.flush();
    expect(textsOf(s.overlay)).toEqual(expect.arrayContaining(["EMA 9", "BB 3", "RSI 14", "MACD 12 26 9"]));
    expect(callsOf(s.main, "setLineDash").some((c) => (c.args[0] as number[]).length === 2)).toBe(true);
    expect(s.callbacks.ondatachange).toHaveBeenCalled();
  });

  it("applies a live last-bar update and an append incrementally", () => {
    s.engine.setIndicators([{ type: "sma", period: 5 }]);
    const created = s.counter.created;
    const candles = [...s.engine.data];
    const last = candles[candles.length - 1];
    s.engine.setCandles([...candles.slice(0, -1), { ...last, close: last.close + 1 }]);
    s.engine.setCandles([...s.engine.data, { ...last, time: last.time + 3_600_000 }]);
    expect(s.counter.created).toBe(created);
    expect(s.counter.update).toBe(2);
    expect(s.engine.store.allSeries()[0].values).toHaveLength(501);
  });
});

describe("ChartEngine follow-latest", () => {
  it("follows new bars at the right edge", () => {
    const next = makeCandles(501);
    s.engine.setCandles(next);
    s.engine.flush();
    expect(s.engine.visibleRange()!.to).toBe(500);
  });

  it("keeps a scrolled-back view where it was when a bar is appended", () => {
    s.engine.panBars(-200);
    s.engine.flush();
    const before = s.engine.visibleRange()!;
    s.engine.setCandles(makeCandles(501));
    s.engine.flush();
    expect(s.engine.visibleRange()).toEqual(before);
  });

  it("keeps the view when history is prepended and resets for a new series", () => {
    s.engine.panBars(-50);
    const offset = s.engine.timeScale.rightOffset;
    const history = makeCandles(600, Date.UTC(2026, 0, 1) - 100 * 3_600_000);
    s.engine.setCandles(history);
    expect(s.engine.timeScale.rightOffset).toBe(offset);
    s.engine.setCandles(makeCandles(10, Date.UTC(2030, 0, 1)));
    expect(s.engine.timeScale.rightOffset).toBe(s.engine.timeScale.options.rightOffset);
  });
});

describe("ChartEngine crosshair", () => {
  it("tracks the pointer and reports the bar and price", () => {
    const x = s.engine.timeScale.indexToX(490);
    s.engine.pointerAt(x, 100);
    const info = s.callbacks.oncrosshairmove.mock.calls[0][0];
    expect(info).toMatchObject({ index: 490, source: "pointer" });
    expect(info.price).toBeGreaterThan(0);
    s.engine.flush();
    expect(callsOf(s.overlay, "setLineDash").length).toBeGreaterThan(0);
    s.engine.pointerAt(x, 100);
    expect(s.callbacks.oncrosshairmove).toHaveBeenCalledTimes(1);
    s.engine.pointerLeave();
    expect(s.callbacks.oncrosshairmove).toHaveBeenLastCalledWith(null);
    s.engine.pointerAt(-10, 10);
    expect(s.engine.currentCrosshair).toBeNull();
  });

  it("moves the keyboard crosshair bar by bar, and jumps to the ends", () => {
    s.engine.crosshairTo("first");
    expect(s.engine.currentCrosshair?.index).toBe(0);
    expect(s.engine.visibleRange()!.from).toBe(0);
    for (let i = 0; i < 3; i++) s.engine.moveCrosshair(1);
    expect(s.engine.currentCrosshair).toMatchObject({ index: 3, source: "keyboard", y: null });
    s.engine.moveCrosshair(-10);
    expect(s.engine.currentCrosshair?.index).toBe(0);
    s.engine.crosshairTo("last");
    expect(s.engine.currentCrosshair?.index).toBe(499);
    s.engine.clearCrosshair();
    s.engine.moveCrosshair(-1);
    expect(s.engine.currentCrosshair?.index).toBe(498);
  });

  it("includes indicator values in the crosshair info", () => {
    s.engine.setIndicators([{ type: "sma", period: 3 }]);
    s.engine.moveCrosshair(0);
    const info = s.callbacks.oncrosshairmove.mock.calls.at(-1)![0];
    expect(info.values["SMA 3"]).toBeTypeOf("number");
  });
});

describe("ChartEngine navigation", () => {
  it("zooms around the crosshair, the latest bar or the centre", () => {
    const spacing = s.engine.timeScale.barSpacing;
    s.engine.zoomBy(2);
    expect(s.engine.timeScale.barSpacing).toBe(spacing * 2);
    expect(s.engine.timeScale.isAtRightEdge()).toBe(true);
    s.engine.moveCrosshair(-5);
    const x = s.engine.timeScale.indexToX(s.engine.currentCrosshair!.index);
    s.engine.zoomBy(0.5);
    expect(s.engine.timeScale.indexToX(s.engine.currentCrosshair!.index)).toBeCloseTo(x);
    s.engine.clearCrosshair();
    s.engine.panBars(-300);
    s.engine.zoomBy(1.5);
    s.engine.resetView();
    expect(s.engine.timeScale.barSpacing).toBe(spacing);
  });
});

describe("ChartEngine dragging", () => {
  it("resizes panes by dragging a separator", () => {
    s.engine.setIndicators([{ type: "rsi" }]);
    const separator = s.engine.currentFrame.layout.separators[0];
    expect(s.engine.hitTest(100, separator)).toEqual({ kind: "separator", index: 0 });
    s.engine.beginSeparatorDrag(0);
    expect(s.engine.dragging).toBe(true);
    s.engine.dragSeparator(-40);
    s.engine.endSeparatorDrag();
    const heights = s.callbacks.onpaneheightschange.mock.calls[0][0];
    expect(heights.rsi).toBeGreaterThan(heights.main / 3);
    s.engine.dragSeparator(10);
    s.engine.endSeparatorDrag();
    expect(s.callbacks.onpaneheightschange).toHaveBeenCalledTimes(1);
  });

  it("applies pane heights from props", () => {
    s.engine.setIndicators([{ type: "rsi" }]);
    s.engine.setPaneHeights({ main: 1, rsi: 1 });
    const [main, rsi] = s.engine.currentFrame.panes;
    expect(Math.abs(main.rect.height - rsi.rect.height)).toBeLessThanOrEqual(1);
  });

  it("drags a stop-loss line and reports the tick-snapped price", () => {
    const close = s.engine.data[499].close;
    s.engine.setPriceLines([{ id: "sl", price: close - 2, kind: "stop-loss", draggable: true }, { price: close + 2 }]);
    const main = s.engine.currentFrame.panes[0];
    const y = main.scale.priceToY(close - 2);
    expect(s.engine.hitTest(100, y + 2)).toEqual({ kind: "price-line", id: "sl" });
    expect(s.engine.hitTest(100, main.scale.priceToY(close + 2))).toEqual({ kind: "plot" });
    s.engine.setHoverLine("sl");
    s.engine.beginPriceLineDrag("sl");
    s.engine.dragPriceLine(main.scale.priceToY(63990.3));
    s.engine.flush();
    s.engine.endPriceLineDrag();
    expect(s.callbacks.onpricelinechange).toHaveBeenCalledWith("sl", 63990.5);
  });

  it("ignores drags of unknown lines", () => {
    s.engine.beginPriceLineDrag("nope");
    s.engine.dragPriceLine(10);
    s.engine.endPriceLineDrag();
    expect(s.callbacks.onpricelinechange).not.toHaveBeenCalled();
  });

  it("hit-tests the axis and outside areas", () => {
    expect(s.engine.hitTest(790, 100)).toEqual({ kind: "axis" });
    expect(s.engine.hitTest(100, 395)).toEqual({ kind: "none" });
  });
});

describe("price snapping", () => {
  it("snaps to the market tick with decimal maths", () => {
    expect(snapPrice(63990.3, market)).toBe(63990.5);
    expect(snapPrice(63990.2, market)).toBe(63990);
    expect(snapPrice(0.1 + 0.2, { ...market, tickSize: "0.01" })).toBe(0.3);
    expect(snapPrice(1.23456, undefined)).toBe(1.2346);
    expect(snapPrice(NaN, market)).toBeNaN();
  });

  it("finds no price line without a main pane", () => {
    expect(hitPriceLine({ panes: [], layout: { width: 10 } } as never, { priceLines: [] } as never, 1, 1)).toBeNull();
  });
});

describe("ChartEngine without a size", () => {
  it("does not paint before it has a size", () => {
    const host = document.createElement("div");
    const main = recordingCanvas();
    const overlay = recordingCanvas();
    const engine = new ChartEngine(host, main.canvas, overlay.canvas, {}, { readTheme: () => theme(), clock: manualClock().clock });
    engine.setCandles(makeCandles(5));
    engine.flush();
    expect(callsOf(main.ctx, "fillText")).toHaveLength(0);
    expect(engine.visibleRange()).toBeNull();
    engine.destroy();
  });
});
