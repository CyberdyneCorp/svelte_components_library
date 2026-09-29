/**
 * Canvas backing stores scaled by devicePixelRatio, and size tracking
 * through ResizeObserver plus DPR changes (browser zoom, moving the window
 * to another screen).
 */

export interface Size {
  width: number;
  height: number;
}

/**
 * Sizes `canvas` to `size` CSS pixels with a `dpr`-scaled backing store.
 * Returns false when nothing changed (resizing clears the canvas).
 */
export function sizeCanvas(canvas: HTMLCanvasElement, size: Size, dpr: number): boolean {
  const width = Math.max(1, Math.round(size.width * dpr));
  const height = Math.max(1, Math.round(size.height * dpr));
  if (canvas.width === width && canvas.height === height) return false;
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${size.width}px`;
  canvas.style.height = `${size.height}px`;
  return true;
}

/** Clears the whole canvas and sets a CSS-pixel transform. */
export function beginFrame(ctx: CanvasRenderingContext2D, dpr: number): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/** Centre of the device pixel containing `value`, for sharp 1px lines. */
export function crisp(value: number, dpr: number): number {
  return (Math.floor(value * dpr) + 0.5) / dpr;
}

/** Snaps `value` to the device-pixel grid. */
export function snap(value: number, dpr: number): number {
  return Math.round(value * dpr) / dpr;
}

export const currentDpr = (): number =>
  typeof window !== "undefined" && window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;

/**
 * Calls `onResize` with the element's content size now, whenever it changes,
 * and when the device pixel ratio changes. Returns a disposer.
 */
export function observeSize(element: HTMLElement, onResize: (size: Size, dpr: number) => void): () => void {
  const measure = () => {
    const rect = element.getBoundingClientRect();
    onResize({ width: rect.width, height: rect.height }, currentDpr());
  };
  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
  observer?.observe(element);
  const stopDpr = watchDpr(measure);
  measure();
  return () => {
    observer?.disconnect();
    stopDpr();
  };
}

/** Re-arms a `(resolution: Ndppx)` media query each time the ratio changes. */
function watchDpr(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  let query: MediaQueryList | null = null;
  const arm = () => {
    query?.removeEventListener("change", handle);
    query = window.matchMedia(`(resolution: ${currentDpr()}dppx)`);
    query.addEventListener?.("change", handle);
  };
  function handle() {
    arm();
    onChange();
  }
  arm();
  return () => query?.removeEventListener?.("change", handle);
}
