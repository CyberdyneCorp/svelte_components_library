import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChartEngine } from "./chartEngine.js";
import type { Hit } from "./hitTest.js";
import { attachInteraction, CURSORS } from "./interaction.js";
import type { FrameClock } from "./scheduler.js";

function fakeEngine(hit: Hit = { kind: "plot" }) {
  return {
    hit,
    hitTest: vi.fn(function (this: { hit: Hit }) {
      return this.hit;
    }),
    beginSeparatorDrag: vi.fn(),
    dragSeparator: vi.fn(),
    endSeparatorDrag: vi.fn(),
    beginPriceLineDrag: vi.fn(),
    dragPriceLine: vi.fn(),
    endPriceLineDrag: vi.fn(),
    setHoverLine: vi.fn(),
    panBy: vi.fn(),
    zoomAt: vi.fn(),
    resetView: vi.fn(),
    pointerAt: vi.fn(),
    pointerLeave: vi.fn(),
  };
}

type Fake = ReturnType<typeof fakeEngine>;

function pointer(type: string, x: number, y: number, init: { id?: number; pointerType?: string; button?: number } = {}) {
  const event = new MouseEvent(type, { clientX: x, clientY: y, button: init.button ?? 0, bubbles: true });
  Object.assign(event, { pointerId: init.id ?? 1, pointerType: init.pointerType ?? "mouse" });
  return event;
}

let element: HTMLDivElement;
let engine: Fake;
let detach: () => void;
let frames: (() => void)[];
let reduced = false;

beforeEach(() => {
  element = document.createElement("div");
  document.body.appendChild(element);
  engine = fakeEngine();
  frames = [];
  reduced = false;
  const clock: FrameClock = { request: (cb) => frames.push(cb), cancel: () => (frames = []) };
  detach = attachInteraction(element, engine as unknown as ChartEngine, { reducedMotion: () => reduced, clock });
});

afterEach(() => {
  detach();
  element.remove();
});

describe("pointer interaction", () => {
  it("pans while dragging and shows the grabbing cursor", () => {
    element.dispatchEvent(pointer("pointerdown", 100, 50));
    expect(element.style.cursor).toBe(CURSORS.grabbing);
    element.dispatchEvent(pointer("pointermove", 130, 50));
    element.dispatchEvent(pointer("pointermove", 120, 50));
    expect(engine.panBy.mock.calls).toEqual([[30], [-10]]);
    expect(engine.pointerAt).toHaveBeenCalledWith(120, 50);
    reduced = true;
    element.dispatchEvent(pointer("pointerup", 120, 50));
    expect(element.style.cursor).toBe(CURSORS.plot);
    expect(frames).toHaveLength(0);
  });

  it("keeps panning with inertia after a flick unless reduced motion is preferred", () => {
    const now = vi.spyOn(performance, "now");
    now.mockReturnValue(0);
    element.dispatchEvent(pointer("pointerdown", 100, 50));
    now.mockReturnValue(20);
    element.dispatchEvent(pointer("pointermove", 140, 50));
    now.mockReturnValue(40);
    element.dispatchEvent(pointer("pointermove", 180, 50));
    element.dispatchEvent(pointer("pointerup", 180, 50));
    expect(frames).toHaveLength(1);
    now.mockReturnValue(56);
    frames.shift()!();
    expect(engine.panBy).toHaveBeenCalledTimes(3);
    // A new press stops the inertia.
    element.dispatchEvent(pointer("pointerdown", 100, 50));
    expect(frames).toHaveLength(0);
    now.mockRestore();
  });

  it("ignores non-primary mouse buttons", () => {
    element.dispatchEvent(pointer("pointerdown", 100, 50, { button: 2 }));
    element.dispatchEvent(pointer("pointermove", 130, 50));
    expect(engine.panBy).not.toHaveBeenCalled();
  });

  it("drags a pane separator", () => {
    engine.hit = { kind: "separator", index: 0 };
    element.dispatchEvent(pointer("pointerdown", 100, 300));
    element.dispatchEvent(pointer("pointermove", 100, 280));
    element.dispatchEvent(pointer("pointerup", 100, 280));
    expect(engine.beginSeparatorDrag).toHaveBeenCalledWith(0);
    expect(engine.dragSeparator).toHaveBeenCalledWith(-20);
    expect(engine.endSeparatorDrag).toHaveBeenCalled();
  });

  it("drags a price line", () => {
    engine.hit = { kind: "price-line", id: "sl" };
    element.dispatchEvent(pointer("pointerdown", 100, 200));
    element.dispatchEvent(pointer("pointermove", 100, 210));
    element.dispatchEvent(pointer("pointerup", 100, 210));
    expect(engine.beginPriceLineDrag).toHaveBeenCalledWith("sl");
    expect(engine.dragPriceLine).toHaveBeenCalledWith(210);
    expect(engine.endPriceLineDrag).toHaveBeenCalled();
  });

  it("shows the hover crosshair, cursor and hovered price line", () => {
    engine.hit = { kind: "price-line", id: "tp" };
    element.dispatchEvent(pointer("pointermove", 10, 20));
    expect(element.style.cursor).toBe(CURSORS["price-line"]);
    expect(engine.setHoverLine).toHaveBeenCalledWith("tp");
    expect(engine.pointerAt).toHaveBeenCalledWith(10, 20);
    element.dispatchEvent(pointer("pointerleave", 10, 20));
    expect(engine.pointerLeave).toHaveBeenCalled();
    expect(engine.setHoverLine).toHaveBeenLastCalledWith(null);
  });

  it("pinch-zooms around the midpoint of two touches", () => {
    element.dispatchEvent(pointer("pointerdown", 100, 50, { id: 1, pointerType: "touch" }));
    element.dispatchEvent(pointer("pointerdown", 200, 50, { id: 2, pointerType: "touch" }));
    element.dispatchEvent(pointer("pointermove", 250, 50, { id: 2, pointerType: "touch" }));
    expect(engine.zoomAt).toHaveBeenCalledWith(1.5, 175);
    element.dispatchEvent(pointer("pointerup", 250, 50, { id: 2, pointerType: "touch" }));
    element.dispatchEvent(pointer("pointerup", 100, 50, { id: 1, pointerType: "touch" }));
    expect(engine.panBy).not.toHaveBeenCalled();
  });

  it("zooms on vertical wheel around the pointer and pans on horizontal wheel", () => {
    const zoom = new WheelEvent("wheel", { deltaY: -100, clientX: 300, cancelable: true });
    element.dispatchEvent(zoom);
    expect(zoom.defaultPrevented).toBe(true);
    expect(engine.zoomAt.mock.calls[0][0]).toBeGreaterThan(1);
    expect(engine.zoomAt.mock.calls[0][1]).toBe(300);
    element.dispatchEvent(new WheelEvent("wheel", { deltaX: 40, deltaY: 5, cancelable: true }));
    expect(engine.panBy).toHaveBeenCalledWith(-40);
  });

  it("resets the view on double-click", () => {
    element.dispatchEvent(new MouseEvent("dblclick"));
    expect(engine.resetView).toHaveBeenCalled();
  });

  it("removes its listeners when detached", () => {
    detach();
    element.dispatchEvent(new MouseEvent("dblclick"));
    expect(engine.resetView).not.toHaveBeenCalled();
    detach = () => {};
  });
});
