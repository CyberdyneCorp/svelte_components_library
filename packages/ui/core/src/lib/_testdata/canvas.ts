/**
 * Canvas test doubles (jsdom has no canvas): a CanvasRenderingContext2D that
 * records every method call and property assignment, and helpers that
 * install it plus ResizeObserver / layout stubs for component tests.
 */

export interface RecordedCall {
  name: string;
  args: unknown[];
}

export interface RecordingContext extends CanvasRenderingContext2D {
  readonly calls: RecordedCall[];
  /** Forgets the recorded calls. */
  reset(): void;
}

/** Width reported by `measureText`: 6px per character. */
export const CHAR_WIDTH = 6;

export function createRecordingContext(canvas?: HTMLCanvasElement): RecordingContext {
  const calls: RecordedCall[] = [];
  const state: Record<string | symbol, unknown> = {
    canvas: canvas ?? { width: 300, height: 150 },
  };
  const special: Record<string, unknown> = {
    calls,
    reset: () => calls.splice(0),
    measureText: (text: string) => {
      calls.push({ name: "measureText", args: [text] });
      return { width: String(text).length * CHAR_WIDTH };
    },
  };
  return new Proxy(state, {
    get(target, key) {
      if (typeof key === "string" && key in special) return special[key];
      if (key in target) return target[key];
      if (typeof key !== "string" || key === "then") return undefined;
      return (...args: unknown[]) => {
        calls.push({ name: key, args });
      };
    },
    set(target, key, value) {
      target[key] = value;
      if (typeof key === "string") calls.push({ name: `${key}=`, args: [value] });
      return true;
    },
  }) as unknown as RecordingContext;
}

/** Calls of one method (or `prop=` assignments). */
export const callsOf = (ctx: RecordingContext, name: string) => ctx.calls.filter((c) => c.name === name);

/** Texts drawn with fillText. */
export const textsOf = (ctx: RecordingContext) => callsOf(ctx, "fillText").map((c) => String(c.args[0]));

/** Values assigned to a property, in order. */
export const assigned = (ctx: RecordingContext, prop: string) => callsOf(ctx, `${prop}=`).map((c) => c.args[0]);

/** A detached canvas whose getContext returns a fresh recording context. */
export function recordingCanvas(): { canvas: HTMLCanvasElement; ctx: RecordingContext } {
  const canvas = document.createElement("canvas");
  const ctx = createRecordingContext(canvas);
  canvas.getContext = (() => ctx) as unknown as HTMLCanvasElement["getContext"];
  return { canvas, ctx };
}

type Size = { width: number; height: number };

/** Controllable ResizeObserver stub; `trigger()` notifies every observer. */
export class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  constructor(private readonly callback: ConstructorParameters<typeof ResizeObserver>[0]) {
    FakeResizeObserver.instances.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {
    FakeResizeObserver.instances = FakeResizeObserver.instances.filter((o) => o !== this);
  }
  static trigger() {
    for (const o of FakeResizeObserver.instances) o.callback([], o as unknown as ResizeObserver);
  }
}

/**
 * Installs canvas contexts (recorded per canvas), ResizeObserver and a fixed
 * element size. Returns the contexts created so far and an uninstaller.
 */
export function installCanvasEnvironment(size: Size = { width: 800, height: 400 }) {
  const contexts = new Map<HTMLCanvasElement, RecordingContext>();
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalRect = HTMLElement.prototype.getBoundingClientRect;
  const originalObserver = globalThis.ResizeObserver;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
    let ctx = contexts.get(this);
    if (!ctx) {
      ctx = createRecordingContext(this);
      contexts.set(this, ctx);
    }
    return ctx;
  } as unknown as HTMLCanvasElement["getContext"];
  HTMLElement.prototype.getBoundingClientRect = function () {
    return { x: 0, y: 0, left: 0, top: 0, right: size.width, bottom: size.height, ...size, toJSON() {} } as DOMRect;
  };
  globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
  return {
    contexts,
    size,
    uninstall() {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
      HTMLElement.prototype.getBoundingClientRect = originalRect;
      globalThis.ResizeObserver = originalObserver;
      FakeResizeObserver.instances = [];
    },
  };
}

/** Deterministic random-walk candles, one per `interval` ms from `start`. */
export function makeCandles(count: number, start = Date.UTC(2026, 0, 1), interval = 3_600_000, seed = 1) {
  let s = seed;
  const random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  let price = 100;
  return Array.from({ length: count }, (_, i) => {
    const open = price;
    const close = Math.max(1, open + (random() - 0.5) * 4);
    const high = Math.max(open, close) + random() * 2;
    const low = Math.max(0.5, Math.min(open, close) - random() * 2);
    price = close;
    return { time: start + i * interval, open, high, low, close, volume: Math.round(100 + random() * 900) };
  });
}
