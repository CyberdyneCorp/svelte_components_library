/** Leverage-slider helpers: clamping, keyboard steps and default marks. */

const NICE_MARKS = [1, 2, 3, 5, 10, 20, 25, 50, 75, 100, 125, 150, 200, 250, 500, 1000];
const MAX_DEFAULT_MARKS = 5;
const PAGE_STEP = 10;

/** Whole leverage within 1…max; non-finite input falls back to 1. */
export function clampLeverage(value: number, max: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(1, Math.round(value)), Math.max(1, Math.floor(max)));
}

/**
 * Up to five marks: 1×, the largest "nice" values below `max`, and `max`
 * itself — `50` → `[1, 10, 20, 25, 50]`, `100` → `[1, 25, 50, 75, 100]`.
 */
export function defaultMarks(max: number): number[] {
  const top = Math.max(1, Math.floor(max));
  const below = NICE_MARKS.filter((mark) => mark > 1 && mark < top);
  const middle = below.slice(-(MAX_DEFAULT_MARKS - 2));
  return [...new Set([1, ...middle, top])];
}

const KEY_DELTAS: Record<string, number> = {
  ArrowRight: 1,
  ArrowUp: 1,
  ArrowLeft: -1,
  ArrowDown: -1,
  PageUp: PAGE_STEP,
  PageDown: -PAGE_STEP,
};

/**
 * The leverage after pressing `key`, or `null` when the key does not move
 * the slider. Arrows step by 1×, Page Up/Down by 10×, Home/End jump to the ends.
 */
export function leverageAfterKey(key: string, value: number, max: number): number | null {
  if (key === "Home") return 1;
  if (key === "End") return clampLeverage(max, max);
  const delta = KEY_DELTAS[key];
  return delta === undefined ? null : clampLeverage(value + delta, max);
}
