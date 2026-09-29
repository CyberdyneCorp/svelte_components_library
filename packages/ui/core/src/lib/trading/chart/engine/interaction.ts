/**
 * Pointer input (design D3): drag to pan (with inertia unless reduced motion
 * is preferred), wheel and pinch zoom around the pointer, double-click to
 * reset, dragging pane separators and draggable price lines, and the hover
 * crosshair.
 */
import type { ChartEngine } from "./chartEngine.js";
import type { Hit } from "./hitTest.js";
import { startInertia, VelocityTracker } from "./inertia.js";
import type { FrameClock } from "./scheduler.js";

export interface InteractionOptions {
  reducedMotion: () => boolean;
  clock?: FrameClock;
}

type Gesture =
  | { kind: "pan"; lastX: number; tracker: VelocityTracker }
  | { kind: "separator"; startY: number }
  | { kind: "price-line" }
  | { kind: "pinch"; distance: number };

interface Point {
  x: number;
  y: number;
}

/** Zoom factor per wheel pixel. */
const WHEEL_ZOOM = 0.0015;
const LINE_HEIGHT = 16;

export const CURSORS: Record<Hit["kind"] | "grabbing", string> = {
  separator: "row-resize",
  "price-line": "ns-resize",
  plot: "crosshair",
  axis: "default",
  none: "default",
  grabbing: "grabbing",
};

/** Zoom factor for a wheel event (deltaY < 0 zooms in). */
export function wheelFactor(event: Pick<WheelEvent, "deltaY" | "deltaMode">): number {
  const delta = event.deltaMode === 1 ? event.deltaY * LINE_HEIGHT : event.deltaY;
  return Math.exp(-delta * WHEEL_ZOOM);
}

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function attachInteraction(element: HTMLElement, engine: ChartEngine, options: InteractionOptions): () => void {
  const pointers = new Map<number, Point>();
  let gesture: Gesture | null = null;
  let stopInertia = () => {};

  const local = (event: MouseEvent): Point => {
    const rect = element.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const setCursor = (kind: keyof typeof CURSORS) => {
    element.style.cursor = CURSORS[kind];
  };

  function startGesture(point: Point): Gesture {
    const hit = engine.hitTest(point.x, point.y);
    if (hit.kind === "separator") {
      engine.beginSeparatorDrag(hit.index);
      return { kind: "separator", startY: point.y };
    }
    if (hit.kind === "price-line") {
      engine.beginPriceLineDrag(hit.id);
      return { kind: "price-line" };
    }
    const tracker = new VelocityTracker();
    tracker.add(performance.now(), point.x);
    setCursor("grabbing");
    return { kind: "pan", lastX: point.x, tracker };
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    stopInertia();
    const point = local(event);
    pointers.set(event.pointerId, point);
    element.setPointerCapture?.(event.pointerId);
    if (pointers.size === 2) {
      endGesture();
      const [a, b] = [...pointers.values()];
      gesture = { kind: "pinch", distance: distance(a, b) };
    } else if (pointers.size === 1) {
      gesture = startGesture(point);
    }
  }

  function moveGesture(active: Gesture, point: Point) {
    switch (active.kind) {
      case "pan":
        engine.panBy(point.x - active.lastX);
        active.lastX = point.x;
        active.tracker.add(performance.now(), point.x);
        break;
      case "separator":
        engine.dragSeparator(point.y - active.startY);
        break;
      case "price-line":
        engine.dragPriceLine(point.y);
        break;
      case "pinch":
        pinch(active);
        break;
    }
  }

  function pinch(active: Extract<Gesture, { kind: "pinch" }>) {
    const [a, b] = [...pointers.values()];
    if (!a || !b) return;
    const next = distance(a, b);
    if (active.distance > 0 && next > 0) engine.zoomAt(next / active.distance, (a.x + b.x) / 2);
    active.distance = next;
  }

  function onPointerMove(event: PointerEvent) {
    const point = local(event);
    if (pointers.has(event.pointerId)) pointers.set(event.pointerId, point);
    if (gesture) moveGesture(gesture, point);
    if (!gesture) hover(point);
    else if (gesture.kind === "pan" && event.pointerType === "mouse") engine.pointerAt(point.x, point.y);
  }

  function hover(point: Point) {
    const hit = engine.hitTest(point.x, point.y);
    setCursor(hit.kind);
    engine.setHoverLine(hit.kind === "price-line" ? hit.id : null);
    engine.pointerAt(point.x, point.y);
  }

  function endGesture() {
    const active = gesture;
    gesture = null;
    if (!active) return;
    if (active.kind === "separator") engine.endSeparatorDrag();
    if (active.kind === "price-line") engine.endPriceLineDrag();
    if (active.kind === "pan") release(active.tracker);
    setCursor("plot");
  }

  function release(tracker: VelocityTracker) {
    if (options.reducedMotion()) return;
    const velocity = tracker.velocity(performance.now());
    stopInertia = startInertia(velocity, (dx) => engine.panBy(dx), options.clock);
  }

  function onPointerUp(event: PointerEvent) {
    pointers.delete(event.pointerId);
    element.releasePointerCapture?.(event.pointerId);
    if (gesture?.kind === "pinch") {
      gesture = null;
      return;
    }
    endGesture();
  }

  function onPointerLeave() {
    if (!gesture) {
      engine.pointerLeave();
      engine.setHoverLine(null);
    }
  }

  function onWheel(event: WheelEvent) {
    event.preventDefault();
    stopInertia();
    const point = local(event);
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) engine.panBy(-event.deltaX);
    else engine.zoomAt(wheelFactor(event), point.x);
  }

  function onDoubleClick() {
    stopInertia();
    engine.resetView();
  }

  type Listener = (event: Event) => void;
  const listeners: [string, Listener, { passive: boolean }?][] = [
    ["pointerdown", onPointerDown as Listener],
    ["pointermove", onPointerMove as Listener],
    ["pointerup", onPointerUp as Listener],
    ["pointercancel", onPointerUp as Listener],
    ["pointerleave", onPointerLeave],
    ["wheel", onWheel as Listener, { passive: false }],
    ["dblclick", onDoubleClick],
  ];
  for (const [type, listener, opts] of listeners) element.addEventListener(type, listener, opts);
  return () => {
    stopInertia();
    for (const [type, listener] of listeners) element.removeEventListener(type, listener);
  };
}
