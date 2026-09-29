import { describe, expect, it, vi } from "vitest";
import { FRICTION, inertiaStep, MIN_VELOCITY, startInertia, VelocityTracker } from "./inertia.js";
import { applyKeyCommand, handleChartKey, KEY_ZOOM, keyCommand, priceLineCommand } from "./keyboard.js";
import { draggableIds, nextDraggable, nudgedPrice, tickStep } from "./priceLineEditor.js";
import { wheelFactor } from "./interaction.js";
import type { ChartEngine } from "./chartEngine.js";
import type { FrameClock } from "./scheduler.js";

describe("keyboard commands", () => {
  const key = (k: string, shiftKey = false) => keyCommand({ key: k, shiftKey }, 10);

  it("maps the navigation keys", () => {
    expect(key("ArrowLeft")).toEqual({ type: "crosshair", delta: -1 });
    expect(key("ArrowRight")).toEqual({ type: "crosshair", delta: 1 });
    expect(key("ArrowLeft", true)).toEqual({ type: "pan", bars: -10 });
    expect(key("ArrowRight", true)).toEqual({ type: "pan", bars: 10 });
    expect(key("+")).toEqual({ type: "zoom", factor: KEY_ZOOM });
    expect(key("=")).toEqual({ type: "zoom", factor: KEY_ZOOM });
    expect(key("-")).toEqual({ type: "zoom", factor: 1 / KEY_ZOOM });
    expect(key("_")).toEqual({ type: "zoom", factor: 1 / KEY_ZOOM });
    expect(key("Home")).toEqual({ type: "edge", edge: "first" });
    expect(key("End")).toEqual({ type: "edge", edge: "last" });
    expect(key("Escape")).toEqual({ type: "clear" });
    expect(key("a")).toBeNull();
  });

  function fakeEngine() {
    return {
      moveCrosshair: vi.fn(),
      panBars: vi.fn(),
      zoomBy: vi.fn(),
      crosshairTo: vi.fn(),
      clearCrosshair: vi.fn(),
      visibleRange: vi.fn(() => ({ from: 0, to: 99, fromTime: 0, toTime: 0 })),
      selectPriceLine: vi.fn(),
      nudgePriceLine: vi.fn(),
      commitPriceLine: vi.fn(),
      cancelPriceLine: vi.fn(),
      editingPriceLine: null as { id: string; price: number } | null,
      hasDraggablePriceLines: false,
    };
  }

  it("maps the price-line keys only when lines are draggable or being edited", () => {
    const line = (k: string, editing: boolean, available = true, shiftKey = false) =>
      priceLineCommand({ key: k, shiftKey }, editing, available);
    expect(line("l", false)).toEqual({ type: "line-select", step: 1 });
    expect(line("L", false, true, true)).toEqual({ type: "line-select", step: -1 });
    expect(line("l", false, false)).toBeNull();
    expect(line("ArrowUp", false)).toBeNull();
    expect(line("ArrowUp", true)).toEqual({ type: "line-nudge", ticks: 1 });
    expect(line("ArrowDown", true, true, true)).toEqual({ type: "line-nudge", ticks: -10 });
    expect(line("Enter", true)).toEqual({ type: "line-commit" });
    expect(line("Escape", true)).toEqual({ type: "line-cancel" });
    expect(line("ArrowLeft", true)).toBeNull();
  });

  it("routes price-line keys to the engine before navigation", () => {
    const engine = fakeEngine();
    const e = engine as unknown as ChartEngine;
    const press = (key: string, shiftKey = false) =>
      handleChartKey(e, new KeyboardEvent("keydown", { key, shiftKey, cancelable: true }));
    expect(press("ArrowUp")).toBe(false);
    engine.hasDraggablePriceLines = true;
    expect(press("l")).toBe(true);
    expect(engine.selectPriceLine).toHaveBeenCalledWith(1);
    engine.editingPriceLine = { id: "sl", price: 1 };
    press("ArrowUp", true);
    press("Enter");
    press("Escape");
    expect(engine.nudgePriceLine).toHaveBeenCalledWith(10);
    expect(engine.commitPriceLine).toHaveBeenCalled();
    expect(engine.cancelPriceLine).toHaveBeenCalled();
    expect(engine.clearCrosshair).not.toHaveBeenCalled();
  });

  it("applies commands to the engine", () => {
    const engine = fakeEngine();
    const e = engine as unknown as ChartEngine;
    applyKeyCommand(e, { type: "crosshair", delta: 1 });
    applyKeyCommand(e, { type: "pan", bars: -3 });
    applyKeyCommand(e, { type: "zoom", factor: 2 });
    applyKeyCommand(e, { type: "edge", edge: "first" });
    applyKeyCommand(e, { type: "clear" });
    expect(engine.moveCrosshair).toHaveBeenCalledWith(1);
    expect(engine.panBars).toHaveBeenCalledWith(-3);
    expect(engine.zoomBy).toHaveBeenCalledWith(2);
    expect(engine.crosshairTo).toHaveBeenCalledWith("first");
    expect(engine.clearCrosshair).toHaveBeenCalled();
  });

  it("handles keydown events, panning a tenth of the visible bars", () => {
    const engine = fakeEngine();
    const event = new KeyboardEvent("keydown", { key: "ArrowLeft", shiftKey: true, cancelable: true });
    expect(handleChartKey(engine as unknown as ChartEngine, event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(engine.panBars).toHaveBeenCalledWith(-10);
    const modified = new KeyboardEvent("keydown", { key: "ArrowLeft", ctrlKey: true });
    expect(handleChartKey(engine as unknown as ChartEngine, modified)).toBe(false);
    const other = new KeyboardEvent("keydown", { key: "x" });
    expect(handleChartKey(engine as unknown as ChartEngine, other)).toBe(false);
    engine.visibleRange.mockReturnValue(null as never);
    handleChartKey(engine as unknown as ChartEngine, new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true }));
    expect(engine.panBars).toHaveBeenLastCalledWith(1);
  });
});

describe("price-line editor helpers", () => {
  const market = { tickSize: "0.5" } as never;
  const lines = [{ price: 1 }, { price: 2, draggable: true }, { id: "sl", price: 3, draggable: true }];

  it("lists and cycles the draggable lines", () => {
    expect(draggableIds(lines)).toEqual(["price-line-1", "sl"]);
    expect(nextDraggable(lines, null, 1)).toBe("price-line-1");
    expect(nextDraggable(lines, null, -1)).toBe("sl");
    expect(nextDraggable(lines, "sl", 1)).toBe("price-line-1");
    expect(nextDraggable(lines, "price-line-1", -1)).toBe("sl");
    expect(nextDraggable(lines, "gone", 1)).toBe("price-line-1");
    expect(nextDraggable([{ price: 1 }], null, 1)).toBeNull();
  });

  it("moves by market ticks, or by the displayed precision without a market", () => {
    expect(tickStep(64000, market)).toBe(0.5);
    expect(nudgedPrice(63990.3, 1, market)).toBe(63991);
    expect(nudgedPrice(64000, -10, market)).toBe(63995);
    expect(tickStep(64000, undefined)).toBe(0.01);
    expect(nudgedPrice(0.1, 2, undefined)).toBe(0.10002);
  });
});

describe("wheel zoom", () => {
  it("zooms in on negative deltaY and scales line-mode deltas", () => {
    expect(wheelFactor({ deltaY: -100, deltaMode: 0 })).toBeGreaterThan(1);
    expect(wheelFactor({ deltaY: 100, deltaMode: 0 })).toBeLessThan(1);
    expect(wheelFactor({ deltaY: 3, deltaMode: 1 })).toBeCloseTo(wheelFactor({ deltaY: 48, deltaMode: 0 }));
  });
});

describe("inertia", () => {
  it("measures the release velocity over the last 100 ms", () => {
    const tracker = new VelocityTracker();
    tracker.add(0, 0);
    tracker.add(50, 10);
    tracker.add(200, 100);
    tracker.add(250, 150);
    expect(tracker.velocity(250)).toBeCloseTo(1);
    expect(tracker.velocity(1000)).toBe(0);
    expect(new VelocityTracker().velocity(0)).toBe(0);
  });

  it("decays velocity by the friction per 16 ms", () => {
    expect(inertiaStep(2, 16)).toEqual({ dx: 32, velocity: 2 * FRICTION });
  });

  it("moves until the velocity drops below the threshold, and can be stopped", () => {
    const callbacks: (() => void)[] = [];
    const clock: FrameClock = { request: (cb) => callbacks.push(cb), cancel: vi.fn() };
    let now = 0;
    const move = vi.fn();
    startInertia(1, move, clock, () => now);
    for (let i = 0; i < 200 && callbacks.length; i++) {
      now += 16;
      callbacks.shift()!();
    }
    expect(move.mock.calls.length).toBeGreaterThan(5);
    expect(callbacks).toHaveLength(0);

    const stop = startInertia(1, move, clock, () => now);
    stop();
    expect(clock.cancel).toHaveBeenCalled();
    expect(startInertia(MIN_VELOCITY / 2, move, clock)).toBeTypeOf("function");
    expect(callbacks).toHaveLength(1);
  });
});
