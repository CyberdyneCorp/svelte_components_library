import { afterEach, describe, expect, it, vi } from "vitest";
import type { MarketSpec } from "../types.js";
import {
  barAnnouncement,
  chartSummary,
  chartTable,
  createThrottle,
  keyboardDescription,
  priceLineAnnouncement,
  priceLineName,
  tableCaption,
  type A11yContext,
} from "./accessibility.js";
import { TimeFormatter } from "./engine/timeLabels.js";
import { DEFAULT_LABELS, fillTemplate, resolveLabels } from "./labels.js";

const market: MarketSpec = {
  symbol: "BTC-PERP",
  baseAsset: "BTC",
  quoteAsset: "USD",
  tickSize: "0.5",
  stepSize: "0.001",
  minSize: "0.001",
  maxLeverage: 50,
};

const HOUR = 3_600_000;
const t0 = Date.UTC(2026, 2, 12, 8);
const candles = [
  { time: t0, open: 100, high: 110, low: 95, close: 105, volume: 1200 },
  { time: t0 + HOUR, open: 105, high: 112, low: 101, close: 110 },
  { time: t0 + 2 * HOUR, open: 110, high: 111, low: 99, close: 99, volume: 800 },
];

const context = (overrides: Partial<A11yContext> = {}): A11yContext => ({
  candles,
  labels: resolveLabels(),
  market,
  locale: "en-US",
  time: new TimeFormatter("UTC", "en-US"),
  interval: HOUR,
  ...overrides,
});

afterEach(() => vi.useRealTimers());

describe("labels", () => {
  it("merges overrides key by key over the defaults", () => {
    const labels = resolveLabels({ showData: "Mostrar dados", columns: { close: "Fecho" }, outputs: { k: "K" } });
    expect(labels.showData).toBe("Mostrar dados");
    expect(labels.columns.close).toBe("Fecho");
    expect(labels.columns.open).toBe("Open");
    expect(labels.outputs.k).toBe("K");
    expect(labels.outputs.d).toBe("%D");
    expect(resolveLabels({ chart: undefined }).chart).toBe(DEFAULT_LABELS.chart);
  });

  it("fills known placeholders and leaves unknown ones", () => {
    expect(fillTemplate("{a} and {b}", { a: 1 })).toBe("1 and {b}");
  });
});

describe("accessible summary", () => {
  it("names the symbol, interval, visible range, last close and change", () => {
    const summary = chartSummary(context(), { from: 0, to: 2, fromTime: t0, toTime: t0 + 2 * HOUR });
    expect(summary).toBe(
      "Price chart: BTC-PERP 1h, Mar 12, 2026, 08:00 to Mar 12, 2026, 10:00. Last close 99.0 (-1.00%).",
    );
  });

  it("uses an explicit interval name, the whole series without a range, and no symbol without a market", () => {
    const summary = chartSummary(context({ market: undefined, interval: "H1" }), null);
    expect(summary).toMatch(/^Price chart: H1, /);
    expect(summary).toContain("Last close 99.00");
  });

  it("describes an empty chart", () => {
    expect(chartSummary(context({ candles: [] }), null)).toBe("Price chart: no data");
  });

  it("is localizable", () => {
    const labels = resolveLabels({ summary: "{symbol}: último {close}", chart: "Gráfico" });
    expect(chartSummary(context({ labels }), null)).toBe("BTC-PERP: último 99.0");
  });
});

describe("crosshair announcement", () => {
  it("announces the bar time, OHLCV and indicator values", () => {
    const text = barAnnouncement(context(), 0, [
      { header: "EMA 21", values: [101.234, NaN, NaN] },
      { header: "RSI 14", values: [NaN, NaN, NaN] },
    ]);
    expect(text).toBe(
      "Mar 12, 2026, 08:00: open 100.0, high 110.0, low 95.0, close 105.0, volume 1.2K, EMA 21 101.23",
    );
  });

  it("uses a dash for missing volume and nothing for a missing bar", () => {
    expect(barAnnouncement(context(), 1, [])).toContain("volume —");
    expect(barAnnouncement(context(), 9, [])).toBe("");
  });
});

describe("data table", () => {
  it("lists the latest bars newest first with OHLCV and indicator columns", () => {
    const table = chartTable(context(), [{ header: "EMA 21", values: [NaN, 104.5, 103.25] }], 2);
    expect(table.columns).toEqual(["Time", "Open", "High", "Low", "Close", "Volume", "EMA 21"]);
    expect(table.rows).toEqual([
      ["Mar 12, 2026, 10:00", "110.0", "111.0", "99.0", "99.0", "800", "103.25"],
      ["Mar 12, 2026, 09:00", "105.0", "112.0", "101.0", "110.0", "", "104.50"],
    ]);
  });

  it("captions the table with the row count", () => {
    expect(tableCaption(resolveLabels(), 50)).toBe("Latest 50 bars");
  });
});

describe("announcement throttle", () => {
  it("speaks the first text at once and collapses a burst into its latest text", () => {
    vi.useFakeTimers();
    const speak = vi.fn();
    const throttle = createThrottle(speak, 300);
    throttle.push("a");
    throttle.push("b");
    throttle.push("c");
    expect(speak.mock.calls).toEqual([["a"]]);
    vi.advanceTimersByTime(300);
    expect(speak.mock.calls).toEqual([["a"], ["c"]]);
    vi.advanceTimersByTime(1000);
    throttle.push("d");
    expect(speak).toHaveBeenLastCalledWith("d");
  });

  it("cancels a pending announcement", () => {
    vi.useFakeTimers();
    const speak = vi.fn();
    const throttle = createThrottle(speak, 300);
    throttle.push("a");
    throttle.push("b");
    throttle.cancel();
    vi.advanceTimersByTime(500);
    expect(speak).toHaveBeenCalledTimes(1);
  });

  it("calls the global timers unbound (browsers reject setTimeout called on another object)", () => {
    vi.useFakeTimers();
    const set = vi.spyOn(globalThis, "setTimeout");
    const clear = vi.spyOn(globalThis, "clearTimeout");
    const throttle = createThrottle(vi.fn(), 300);
    throttle.push("a");
    throttle.push("b");
    throttle.cancel();
    expect(set).toHaveBeenCalledTimes(1);
    expect(set.mock.contexts[0]).toBeUndefined();
    expect(clear.mock.contexts[0]).toBeUndefined();
    set.mockRestore();
    clear.mockRestore();
  });
});

describe("price-line announcements", () => {
  const labels = resolveLabels();
  const ctx = { candles, labels, market, locale: "en-US", time: new TimeFormatter("UTC", "en-US"), interval: HOUR } as A11yContext;

  it("names a line by label, kind tag, or the generic name", () => {
    expect(priceLineName(labels, { price: 1, label: "Target" })).toBe("Target");
    expect(priceLineName(labels, { price: 1, kind: "stop-loss" })).toBe("SL");
    expect(priceLineName(labels, { price: 1 })).toBe("Price line");
  });

  it("fills each phase template with the tick-precision price", () => {
    const line = { id: "tp", price: 110, kind: "take-profit" as const };
    expect(priceLineAnnouncement(ctx, { phase: "move", id: "tp", price: 110.5, line })).toBe("TP 110.5");
    expect(priceLineAnnouncement(ctx, { phase: "commit", id: "tp", price: 1234, line })).toBe("TP set to 1,234.0");
    const custom = { ...ctx, labels: resolveLabels({ priceLineEdit: { cancel: "{line}: {price} mantido" } }) };
    expect(priceLineAnnouncement(custom, { phase: "cancel", id: "tp", price: 110, line })).toBe("TP: 110.0 mantido");
  });

  it("adds the price-line help to the description only with draggable lines", () => {
    expect(keyboardDescription(labels, false)).toBe(labels.keyboardHint);
    expect(keyboardDescription(labels, true)).toBe(`${labels.keyboardHint} ${labels.priceLineHint}`);
  });
});
