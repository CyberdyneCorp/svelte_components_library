import { afterEach, describe, expect, it, vi } from "vitest";
import { makeCandles } from "../../../_testdata/canvas.js";
import { fakeBindings } from "../../../_testdata/chartIndicators.js";
import { ema, macd } from "../../indicators/index.js";
import { defaultResolver } from "../indicatorBindings.js";
import { resolveLabels } from "../labels.js";
import type { IndicatorConfig } from "../types.js";
import { IndicatorStore } from "./indicatorStore.js";
import { classifyChange, snapshotOf } from "./series.js";

const labels = resolveLabels();
const nan = (v: number | null) => (v === null ? NaN : v);

afterEach(() => vi.restoreAllMocks());

describe("IndicatorStore", () => {
  it("assigns panes, titles, headers and palette slots", () => {
    const { resolver } = fakeBindings();
    const store = new IndicatorStore(resolver);
    const configs: IndicatorConfig[] = [
      { type: "ema", period: 9, color: "red" },
      { type: "ema", period: 21 },
      { type: "bollinger", period: 3 },
      { type: "rsi", period: 14 },
      { type: "rsi", period: 7, pane: "osc" },
    ];
    store.configure(configs, labels, makeCandles(20));
    expect(store.instances.map((i) => [i.pane, i.title])).toEqual([
      ["main", "EMA 9"],
      ["main", "EMA 21"],
      ["main", "BB 3"],
      ["rsi", "RSI 14"],
      ["osc", "RSI 7"],
    ]);
    expect(store.subPanes()).toEqual(["rsi", "osc"]);
    expect(store.inPane("main")).toHaveLength(3);
    expect(store.allSeries().map((s) => s.header)).toEqual([
      "EMA 9",
      "EMA 21",
      "BB 3 Basis",
      "BB 3 Upper",
      "BB 3 Lower",
      "RSI 14",
      "RSI 14 Histogram",
      "RSI 7",
      "RSI 7 Histogram",
    ]);
    expect(store.allSeries().map((s) => s.slot)).toEqual([0, 1, 2, 3, 4, 0, 1, 0, 1]);
    expect(store.instances[0].series[0].color).toBe("red");
    expect(store.instances[0].id).toBe("ema:main:EMA 9");
  });

  it("uses localized indicator and output names", () => {
    const { resolver } = fakeBindings();
    const store = new IndicatorStore(resolver);
    const custom = resolveLabels({ indicators: { bollinger: "Bandas" }, outputs: { upper: "Superior" } });
    store.configure([{ type: "bollinger", period: 3 }], custom, makeCandles(5));
    expect(store.allSeries()[1].header).toBe("Bandas 3 Superior");
  });

  it("aligns values with the candles, NaN during warm-up", () => {
    const { resolver } = fakeBindings();
    const store = new IndicatorStore(resolver);
    const candles = makeCandles(10);
    store.configure([{ type: "sma", period: 3 }], labels, candles);
    const values = store.allSeries()[0].values;
    expect(values).toHaveLength(10);
    expect(values[1]).toBeNaN();
    expect(values[2]).toBeCloseTo((candles[0].close + candles[1].close + candles[2].close) / 3);
  });

  it("updates the tail incrementally for a replaced last bar and appended bars", () => {
    const { resolver, counter } = fakeBindings();
    const store = new IndicatorStore(resolver);
    const full = makeCandles(1000);
    let candles = full.slice(0, 998);
    store.configure([{ type: "sma", period: 5 }], labels, candles);
    const created = counter.created;
    const nextCalls = counter.next;

    const revised = [...candles.slice(0, -1), { ...candles[997], close: candles[997].close + 5 }];
    store.apply(classifyChange(snapshotOf(candles), revised), revised);
    candles = revised;
    expect(counter.update).toBe(1);

    const appended = [...candles, full[998], full[999]];
    store.apply(classifyChange(snapshotOf(candles), appended), appended);
    expect(counter.created).toBe(created);
    expect(counter.next - nextCalls).toBe(2);
    expect(counter.update).toBe(2);

    const reference = new IndicatorStore(resolver);
    reference.configure([{ type: "sma", period: 5 }], labels, appended);
    expect(store.allSeries()[0].values).toEqual(reference.allSeries()[0].values);
  });

  it("recomputes on a reset", () => {
    const { resolver, counter } = fakeBindings();
    const store = new IndicatorStore(resolver);
    store.configure([{ type: "sma", period: 5 }], labels, makeCandles(10));
    const version = store.version;
    const other = makeCandles(4, Date.UTC(2020, 0, 1));
    store.apply({ kind: "reset" }, other);
    expect(counter.created).toBe(2);
    expect(store.allSeries()[0].values).toHaveLength(4);
    expect(store.version).toBeGreaterThan(version);
  });

  it("skips unknown types with one warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = new IndicatorStore(() => undefined);
    const configs = [{ type: "nope" }, { type: "nope" }] as unknown as IndicatorConfig[];
    store.configure(configs, labels, makeCandles(3));
    store.configure(configs, labels, makeCandles(3));
    expect(store.instances).toHaveLength(0);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("disables an indicator with invalid parameters and reports it", () => {
    const onerror = vi.fn();
    const store = new IndicatorStore(defaultResolver, onerror);
    store.configure(
      [
        { type: "ema", period: 0 },
        { type: "sma", period: 2 },
      ],
      labels,
      makeCandles(5),
    );
    expect(onerror).toHaveBeenCalledTimes(1);
    expect(onerror.mock.calls[0][0]).toMatchObject({ type: "ema", period: 0 });
    expect(onerror.mock.calls[0][1]).toBeInstanceOf(RangeError);
    expect(store.instances[0].error).toBeInstanceOf(RangeError);
    expect(store.instances[0].series[0].values).toEqual([]);
    expect(store.instances[1].series[0].values[1]).toBeGreaterThan(0);
  });

  it("disables an indicator when live data is invalid, keeping the others", () => {
    const onerror = vi.fn();
    const store = new IndicatorStore(defaultResolver, onerror);
    const candles = makeCandles(5);
    store.configure([{ type: "sma", period: 2 }], labels, candles);
    const bad = [...candles, { ...candles[4], time: candles[4].time + 3_600_000, close: NaN }];
    store.apply(classifyChange(snapshotOf(candles), bad), bad);
    expect(onerror).toHaveBeenCalledTimes(1);
    const ok = [...candles, { ...candles[4], time: candles[4].time + 3_600_000 }];
    store.apply({ kind: "append", count: 1 }, ok);
    expect(store.instances[0].series[0].values).toEqual([]);
  });

  it("warns by default when an indicator fails", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = new IndicatorStore(defaultResolver);
    store.configure([{ type: "wma", period: -3 }], labels, makeCandles(3));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('indicator "wma" disabled'));
  });

  it("matches the batch functions of trading/indicators", () => {
    const store = new IndicatorStore(defaultResolver);
    const candles = makeCandles(80);
    const closes = candles.map((c) => c.close);
    store.configure([{ type: "ema", period: 9 }, { type: "macd" }], labels, candles);
    expect(store.instances[0].series[0].values).toEqual(ema(closes, 9).map(nan));
    const batch = macd(closes);
    const bySpec = Object.fromEntries(store.instances[1].series.map((s) => [s.spec.key, s.values]));
    expect(bySpec.macd).toEqual(batch.macd.map(nan));
    expect(bySpec.signal).toEqual(batch.signal.map(nan));
    expect(bySpec.histogram).toEqual(batch.histogram.map(nan));
  });
});
