import { describe, expect, it, vi } from "vitest";
import { FRICTION, inertiaStep, MIN_VELOCITY, startInertia, VelocityTracker } from "./inertia.js";
import { applyKeyCommand, handleChartKey, KEY_ZOOM, keyCommand } from "./keyboard.js";
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
    };
  }

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
