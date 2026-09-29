/**
 * The incremental-calculator contract shared by every indicator.
 *
 * A calculator holds a *committed* state (all closed bars) plus one *pending*
 * bar (the one still forming). `next` closes the pending bar and opens a new
 * one; `update` replaces the pending bar. Because the pending bar never touches
 * the committed state, a revision costs the same O(1) as an append.
 */

/** A value per bar: `null` while the indicator is warming up. */
export type IndicatorValue = number | null;

/** An indicator series aligned index-for-index with its input. */
export type IndicatorSeries = IndicatorValue[];

export interface IndicatorCalculator<I, O> {
  /** Append a new bar and return the indicator value for it. */
  next(input: I): O;
  /**
   * Revise the most recent bar (e.g. a live tick on an open candle) and return
   * its new value. Before the first `next`, behaves like `next`.
   */
  update(input: I): O;
}

/**
 * Internal building block. `preview` computes the output for `input` as the
 * pending bar without touching committed state (it may cache what `commit`
 * needs); `commit` folds the last previewed bar into committed state.
 */
export interface Core<I, O> {
  preview(input: I): O;
  commit(): void;
}

/** Wrap a core as a public calculator. `check` validates input before any state changes. */
export function fromCore<I, O>(
  core: Core<I, O>,
  check: (input: I) => void,
): IndicatorCalculator<I, O> {
  let open = false;
  return {
    next(input) {
      check(input);
      if (open) core.commit();
      open = true;
      return core.preview(input);
    },
    update(input) {
      check(input);
      open = true;
      return core.preview(input);
    },
  };
}

/**
 * Chain a core behind a warming-up input: `null` inputs yield `null` and are not
 * committed. Warm-up depends only on the bar count, so a bar's nullness never
 * changes between `update`s.
 */
export function gated<O>(core: Core<number, O>): Core<IndicatorValue, O | null> {
  let active = false;
  return {
    preview(input) {
      active = input !== null;
      return input === null ? null : core.preview(input);
    },
    commit() {
      if (active) core.commit();
    },
  };
}

/** Run a calculator over a whole series. Batch functions are defined this way, so batch ≡ incremental. */
export function runBatch<I, O>(inputs: readonly I[], calc: IndicatorCalculator<I, O>): O[] {
  const out = new Array<O>(inputs.length);
  for (let i = 0; i < inputs.length; i++) out[i] = calc.next(inputs[i]);
  return out;
}

/** Turn per-bar objects into an object of aligned arrays. */
export function columns<K extends string>(
  rows: readonly Record<K, IndicatorValue>[],
  keys: readonly K[],
): Record<K, IndicatorSeries> {
  const result = {} as Record<K, IndicatorSeries>;
  for (const key of keys) result[key] = rows.map((row) => row[key]);
  return result;
}
