/** Nice-number tick generation for price axes. */

const NICE_STEPS = [1, 2, 2.5, 5, 10];

/** Smallest "nice" step (1, 2, 2.5, 5 × 10^k) that is at least `rough`. */
export function niceStep(rough: number): number {
  if (!(rough > 0) || !Number.isFinite(rough)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const nice = NICE_STEPS.find((step) => step >= normalized - 1e-9) ?? 10;
  return nice * magnitude;
}

/** Decimal places needed to print multiples of `step` exactly. */
export function stepDecimals(step: number): number {
  if (!(step > 0) || !Number.isFinite(step)) return 0;
  return Math.max(0, Math.ceil(-Math.log10(step) - 1e-9) + (niceFraction(step) ? 1 : 0));
}

/** True for steps such as 2.5 × 10^k, which need one more digit than 10^k. */
function niceFraction(step: number): boolean {
  const normalized = step / 10 ** Math.floor(Math.log10(step));
  return Math.abs(normalized - 2.5) < 1e-9;
}

/**
 * Evenly spaced round values covering [min, max], at most about `maxCount`
 * of them. Values are rounded to the step's decimals to avoid float noise.
 */
export function linearTicks(min: number, max: number, maxCount: number): number[] {
  if (!(max > min) || maxCount < 1) return [];
  const step = niceStep((max - min) / maxCount);
  const decimals = stepDecimals(step);
  const ticks: number[] = [];
  for (let value = Math.ceil(min / step) * step; value <= max + step * 1e-9; value += step) {
    ticks.push(Number(value.toFixed(Math.min(20, decimals))));
  }
  return ticks;
}

/**
 * Ticks for a log scale over [min, max] (both > 0): 1-2-5 per decade when
 * the range spans several decades, otherwise linear ticks.
 */
export function logTicks(min: number, max: number, maxCount: number): number[] {
  if (!(min > 0) || !(max > min)) return [];
  const decades = Math.log10(max) - Math.log10(min);
  if (decades < 1) return linearTicks(min, max, maxCount);
  const multipliers = decades * 3 <= maxCount ? [1, 2, 5] : [1];
  const every = Math.max(1, Math.ceil((decades * multipliers.length) / maxCount));
  const ticks: number[] = [];
  for (let exp = Math.floor(Math.log10(min)); exp <= Math.ceil(Math.log10(max)); exp++) {
    for (const m of multipliers) {
      const value = m * 10 ** exp;
      if (value >= min && value <= max) ticks.push(Number(value.toPrecision(12)));
    }
  }
  return ticks.filter((_, i) => i % every === 0);
}
