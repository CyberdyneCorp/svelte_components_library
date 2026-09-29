/**
 * Frame coalescing for high-frequency market data (OpenSpec add-trading-suite, D8).
 *
 * `push` may be called any number of times; `apply` runs at most once per
 * animation frame, with the last pushed value.
 */

export interface FrameScheduler {
  request(callback: () => void): number;
  cancel(handle: number): void;
}

const FRAME_MS = 16;

/**
 * `requestAnimationFrame`, or a 16 ms timer where it is missing (SSR, some
 * test environments). Resolved on each call, so fake timers installed after
 * import are honoured.
 */
export const animationFrameScheduler: FrameScheduler = {
  request(callback) {
    if (hasAnimationFrame()) return globalThis.requestAnimationFrame(() => callback());
    return globalThis.setTimeout(callback, FRAME_MS) as unknown as number;
  },
  cancel(handle) {
    if (hasAnimationFrame()) globalThis.cancelAnimationFrame(handle);
    else globalThis.clearTimeout(handle);
  },
};

function hasAnimationFrame(): boolean {
  return (
    typeof globalThis.requestAnimationFrame === "function" &&
    typeof globalThis.cancelAnimationFrame === "function"
  );
}

export interface FrameCoalescer<T> {
  /** Queues `value`; replaces any value already waiting for this frame. */
  push(value: T): void;
  /** Applies the waiting value now, if any. */
  flush(): void;
  /** Drops the waiting value and the scheduled frame. */
  cancel(): void;
  readonly pending: boolean;
}

export function createFrameCoalescer<T>(
  apply: (value: T) => void,
  scheduler: FrameScheduler = animationFrameScheduler,
): FrameCoalescer<T> {
  let waiting: { value: T } | null = null;
  let handle: number | null = null;

  function flush() {
    if (handle !== null) scheduler.cancel(handle);
    handle = null;
    if (!waiting) return;
    const { value } = waiting;
    waiting = null;
    apply(value);
  }

  return {
    push(value) {
      waiting = { value };
      if (handle === null) {
        handle = scheduler.request(() => {
          handle = null;
          flush();
        });
      }
    },
    flush,
    cancel() {
      if (handle !== null) scheduler.cancel(handle);
      handle = null;
      waiting = null;
    },
    get pending() {
      return waiting !== null;
    },
  };
}
