import { describe, expect, it, vi } from "vitest";
import { createScheduler, type FrameClock } from "./scheduler.js";

function manualClock() {
  const queue = new Map<number, () => void>();
  let next = 1;
  const clock: FrameClock = {
    request: (cb) => {
      queue.set(next, cb);
      return next++;
    },
    cancel: (handle) => queue.delete(handle),
  };
  const tick = () => {
    const callbacks = [...queue.values()];
    queue.clear();
    callbacks.forEach((cb) => cb());
  };
  return { clock, tick, queue };
}

describe("scheduler", () => {
  it("coalesces invalidations into one frame", () => {
    const { clock, tick, queue } = manualClock();
    const draw = vi.fn();
    const s = createScheduler(draw, clock);
    s.invalidate("main");
    s.invalidate("overlay");
    s.invalidate("main");
    expect(queue.size).toBe(1);
    expect(s.pending).toBe(true);
    tick();
    expect(draw).toHaveBeenCalledTimes(1);
    expect(draw).toHaveBeenCalledWith(true, true);
    expect(s.pending).toBe(false);
  });

  it("draws only the dirty layer", () => {
    const { clock, tick } = manualClock();
    const draw = vi.fn();
    const s = createScheduler(draw, clock);
    s.invalidate("overlay");
    tick();
    expect(draw).toHaveBeenCalledWith(false, true);
    tick();
    expect(draw).toHaveBeenCalledTimes(1);
  });

  it("flushes synchronously and skips when clean", () => {
    const { clock, queue } = manualClock();
    const draw = vi.fn();
    const s = createScheduler(draw, clock);
    s.flush();
    expect(draw).not.toHaveBeenCalled();
    s.invalidate();
    s.flush();
    expect(draw).toHaveBeenCalledWith(true, true);
    expect(queue.size).toBe(0);
  });

  it("stops after dispose", () => {
    const { clock, tick, queue } = manualClock();
    const draw = vi.fn();
    const s = createScheduler(draw, clock);
    s.invalidate();
    s.dispose();
    expect(queue.size).toBe(0);
    s.invalidate();
    tick();
    expect(draw).not.toHaveBeenCalled();
  });

  it("uses requestAnimationFrame by default", () => {
    const raf = vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(() => 7);
    const caf = vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});
    const s = createScheduler(() => {});
    s.invalidate();
    expect(raf).toHaveBeenCalledTimes(1);
    s.dispose();
    expect(caf).toHaveBeenCalledWith(7);
    raf.mockRestore();
    caf.mockRestore();
  });
});
