/**
 * Frame scheduler (design D3): a dirty flag per canvas layer and at most one
 * requestAnimationFrame in flight. Nothing is drawn unless something changed.
 */

export type Layer = "main" | "overlay";

export interface Scheduler {
  /** Marks a layer (or both) dirty and schedules a frame. */
  invalidate(layer?: Layer | "all"): void;
  /** Draws the dirty layers now, cancelling the pending frame. */
  flush(): void;
  dispose(): void;
  readonly pending: boolean;
}

export interface FrameClock {
  request(callback: () => void): number;
  cancel(handle: number): void;
}

export const animationFrameClock = (): FrameClock => ({
  request: (callback) => requestAnimationFrame(() => callback()),
  cancel: (handle) => cancelAnimationFrame(handle),
});

export function createScheduler(
  draw: (main: boolean, overlay: boolean) => void,
  clock: FrameClock = animationFrameClock(),
): Scheduler {
  let main = false;
  let overlay = false;
  let handle: number | null = null;
  let disposed = false;

  function run() {
    handle = null;
    if (disposed || (!main && !overlay)) return;
    const drawMain = main;
    const drawOverlay = overlay;
    main = false;
    overlay = false;
    draw(drawMain, drawOverlay);
  }

  return {
    invalidate(layer = "all") {
      if (disposed) return;
      if (layer !== "overlay") main = true;
      if (layer !== "main") overlay = true;
      if (handle === null) handle = clock.request(run);
    },
    flush() {
      if (handle !== null) clock.cancel(handle);
      run();
    },
    dispose() {
      disposed = true;
      if (handle !== null) clock.cancel(handle);
      handle = null;
    },
    get pending() {
      return handle !== null;
    },
  };
}
