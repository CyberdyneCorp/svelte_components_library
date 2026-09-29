import { afterEach, describe, it, expect, vi } from "vitest";
import { animationFrameScheduler, createFrameCoalescer, type FrameScheduler } from "./coalesce.js";

/** A manual requestAnimationFrame: frames run only when `frame()` is called. */
function fakeFrames() {
  const callbacks = new Map<number, () => void>();
  let next = 1;
  const scheduler: FrameScheduler = {
    request(callback) {
      callbacks.set(next, callback);
      return next++;
    },
    cancel(handle) {
      callbacks.delete(handle);
    },
  };
  function frame() {
    const due = [...callbacks.values()];
    callbacks.clear();
    due.forEach((callback) => callback());
  }
  return { scheduler, frame, get scheduled() {
    return callbacks.size;
  } };
}

describe("createFrameCoalescer", () => {
  it("applies a burst once per frame with the last value (spec scenario)", () => {
    const frames = fakeFrames();
    const apply = vi.fn();
    const coalescer = createFrameCoalescer<number>(apply, frames.scheduler);
    for (let i = 1; i <= 20; i++) coalescer.push(i);
    expect(apply).not.toHaveBeenCalled();
    expect(frames.scheduled).toBe(1);
    frames.frame();
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith(20);
  });

  it("schedules a new frame for values pushed after a flush", () => {
    const frames = fakeFrames();
    const apply = vi.fn();
    const coalescer = createFrameCoalescer<string>(apply, frames.scheduler);
    coalescer.push("a");
    frames.frame();
    coalescer.push("b");
    coalescer.push("c");
    frames.frame();
    expect(apply.mock.calls).toEqual([["a"], ["c"]]);
  });

  it("does nothing on an idle frame", () => {
    const frames = fakeFrames();
    const apply = vi.fn();
    createFrameCoalescer(apply, frames.scheduler);
    frames.frame();
    expect(apply).not.toHaveBeenCalled();
  });

  it("flushes synchronously and cancels the frame", () => {
    const frames = fakeFrames();
    const apply = vi.fn();
    const coalescer = createFrameCoalescer<number>(apply, frames.scheduler);
    coalescer.push(1);
    expect(coalescer.pending).toBe(true);
    coalescer.flush();
    expect(apply).toHaveBeenCalledWith(1);
    expect(coalescer.pending).toBe(false);
    expect(frames.scheduled).toBe(0);
  });

  it("cancel drops the pending value", () => {
    const frames = fakeFrames();
    const apply = vi.fn();
    const coalescer = createFrameCoalescer<number>(apply, frames.scheduler);
    coalescer.push(1);
    coalescer.cancel();
    frames.frame();
    expect(apply).not.toHaveBeenCalled();
    coalescer.cancel();
  });
});

describe("animationFrameScheduler", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("uses requestAnimationFrame when available", () => {
    const raf = vi.fn(() => 7);
    const caf = vi.fn();
    vi.stubGlobal("requestAnimationFrame", raf);
    vi.stubGlobal("cancelAnimationFrame", caf);
    const callback = vi.fn();
    expect(animationFrameScheduler.request(callback)).toBe(7);
    (raf.mock.calls[0] as unknown as [() => void])[0]();
    expect(callback).toHaveBeenCalledOnce();
    animationFrameScheduler.cancel(7);
    expect(caf).toHaveBeenCalledWith(7);
  });

  it("falls back to a 16 ms timer", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    vi.stubGlobal("requestAnimationFrame", undefined);
    vi.stubGlobal("cancelAnimationFrame", undefined);
    const callback = vi.fn();
    const handle = animationFrameScheduler.request(callback);
    vi.advanceTimersByTime(15);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledOnce();
    const cancelled = vi.fn();
    animationFrameScheduler.cancel(animationFrameScheduler.request(cancelled));
    vi.advanceTimersByTime(32);
    expect(cancelled).not.toHaveBeenCalled();
    expect(typeof handle).not.toBe("undefined");
  });
});
