/**
 * Kinetic panning after a flick (design D3: the only animation, disabled
 * under prefers-reduced-motion). Pure maths plus a small rAF loop.
 */
import { animationFrameClock, type FrameClock } from "./scheduler.js";

/** Pointer samples of the last `window` ms, for the release velocity. */
export class VelocityTracker {
  private samples: { t: number; x: number }[] = [];

  constructor(private readonly window = 100) {}

  add(t: number, x: number): void {
    this.samples.push({ t, x });
    while (this.samples.length > 2 && t - this.samples[0].t > this.window) this.samples.shift();
  }

  /** Velocity in px/ms (0 without enough movement). */
  velocity(now: number): number {
    const recent = this.samples.filter((s) => now - s.t <= this.window);
    if (recent.length < 2) return 0;
    const first = recent[0];
    const last = recent[recent.length - 1];
    const dt = last.t - first.t;
    return dt > 0 ? (last.x - first.x) / dt : 0;
  }
}

/** Velocity below which inertia stops (px/ms). */
export const MIN_VELOCITY = 0.05;
/** Fraction of velocity kept per 16 ms. */
export const FRICTION = 0.92;

/** One animation step: the distance to move and the decayed velocity. */
export function inertiaStep(velocity: number, dt: number): { dx: number; velocity: number } {
  return { dx: velocity * dt, velocity: velocity * FRICTION ** (dt / 16) };
}

/**
 * Runs inertia from `velocity`, calling `move(dx)` each frame until it
 * decays. Returns a function that stops it.
 */
export function startInertia(
  velocity: number,
  move: (dx: number) => void,
  clock: FrameClock = animationFrameClock(),
  now: () => number = () => performance.now(),
): () => void {
  let handle: number | null = null;
  let last = now();
  let v = velocity;
  const tick = () => {
    const t = now();
    const step = inertiaStep(v, Math.min(64, t - last));
    last = t;
    v = step.velocity;
    move(step.dx);
    handle = Math.abs(v) >= MIN_VELOCITY ? clock.request(tick) : null;
  };
  if (Math.abs(v) >= MIN_VELOCITY) handle = clock.request(tick);
  return () => {
    if (handle !== null) clock.cancel(handle);
    handle = null;
  };
}
