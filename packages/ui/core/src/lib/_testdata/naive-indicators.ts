/**
 * Naive reference implementations of the trading indicators (tests only).
 *
 * Written independently of `trading/indicators/` straight from the textbook
 * definitions: every windowed value is recomputed from a fresh slice (no
 * running sums, deques or incremental state), and Wilder smoothing uses the
 * original running-*sum* form from Wilder's "New Concepts in Technical Trading
 * Systems" (1978) where the library uses the equivalent running-average form.
 * Slow (O(n · period)) on purpose.
 */
import type { Candle } from "../trading/types.js";

type Series = (number | null)[];

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function naiveSma(values: number[], period: number): Series {
  return values.map((_, i) => (i < period - 1 ? null : mean(values.slice(i - period + 1, i + 1))));
}

export function naiveWma(values: number[], period: number): Series {
  return values.map((_, i) => {
    if (i < period - 1) return null;
    let num = 0;
    let den = 0;
    for (let w = 1; w <= period; w++) {
      num += w * values[i - period + w];
      den += w;
    }
    return num / den;
  });
}

/** EMA with the first value = SMA of the first `period` values; `alpha` defaults to 2 / (period + 1). */
export function naiveEma(values: number[], period: number, alpha = 2 / (period + 1)): Series {
  const out: Series = values.map(() => null);
  if (values.length < period) return out;
  let prev = mean(values.slice(0, period));
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = alpha * values[i] + (1 - alpha) * prev;
    out[i] = prev;
  }
  return out;
}

/** Wilder's running sum: first = sum of the first `period` inputs, then S − S/period + x. Offset = index of inputs[0]. */
function wilderSums(inputs: number[], period: number, offset: number, length: number): Series {
  const out: Series = new Array(length).fill(null);
  if (inputs.length < period) return out;
  let sum = inputs.slice(0, period).reduce((a, b) => a + b, 0);
  out[offset + period - 1] = sum;
  for (let j = period; j < inputs.length; j++) {
    sum = sum - sum / period + inputs[j];
    out[offset + j] = sum;
  }
  return out;
}

export function naiveRsi(closes: number[], period: number): Series {
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  const g = wilderSums(gains, period, 1, closes.length);
  const l = wilderSums(losses, period, 1, closes.length);
  return closes.map((_, i) => {
    const gain = g[i];
    const loss = l[i];
    if (gain === null || loss === null) return null;
    if (gain + loss === 0) return 50;
    return 100 - 100 / (1 + gain / loss);
  });
}

export function naiveBollinger(values: number[], period: number, k: number) {
  const middle: Series = [];
  const upper: Series = [];
  const lower: Series = [];
  values.forEach((_, i) => {
    if (i < period - 1) {
      middle.push(null);
      upper.push(null);
      lower.push(null);
      return;
    }
    const slice = values.slice(i - period + 1, i + 1);
    const m = mean(slice);
    const sd = Math.sqrt(mean(slice.map((x) => (x - m) ** 2)));
    middle.push(m);
    upper.push(m + k * sd);
    lower.push(m - k * sd);
  });
  return { middle, upper, lower };
}

function trueRanges(candles: Candle[]): number[] {
  return candles.map((c, i) =>
    i === 0
      ? c.high - c.low
      : Math.max(
          c.high - c.low,
          Math.abs(c.high - candles[i - 1].close),
          Math.abs(c.low - candles[i - 1].close),
        ),
  );
}

export function naiveAtr(candles: Candle[], period: number): Series {
  return wilderSums(trueRanges(candles), period, 0, candles.length).map((s) =>
    s === null ? null : s / period,
  );
}

export function naiveAdx(candles: Candle[], period: number) {
  const n = candles.length;
  const tr = trueRanges(candles).slice(1);
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  for (let i = 1; i < n; i++) {
    const up = candles[i].high - candles[i - 1].high;
    const down = candles[i - 1].low - candles[i].low;
    plusDM.push(up > down && up > 0 ? up : 0);
    minusDM.push(down > up && down > 0 ? down : 0);
  }
  const trS = wilderSums(tr, period, 1, n);
  const pS = wilderSums(plusDM, period, 1, n);
  const mS = wilderSums(minusDM, period, 1, n);
  const plusDI: Series = trS.map((t, i) => (t === null ? null : t === 0 ? 0 : (100 * pS[i]!) / t));
  const minusDI: Series = trS.map((t, i) => (t === null ? null : t === 0 ? 0 : (100 * mS[i]!) / t));
  const dx: number[] = [];
  for (let i = period; i < n; i++) {
    const p = plusDI[i]!;
    const m = minusDI[i]!;
    dx.push(p + m === 0 ? 0 : (100 * Math.abs(p - m)) / (p + m));
  }
  const adx = wilderSums(dx, period, period, n).map((s) => (s === null ? null : s / period));
  return { adx, plusDI, minusDI };
}

export function naiveMacd(values: number[], fast: number, slow: number, signalPeriod: number) {
  const f = naiveEma(values, fast);
  const s = naiveEma(values, slow);
  const macd: Series = values.map((_, i) =>
    f[i] === null || s[i] === null ? null : f[i]! - s[i]!,
  );
  const start = slow - 1;
  const signal: Series = values.map(() => null);
  const sig = naiveEma(macd.slice(start) as number[], signalPeriod);
  sig.forEach((v, j) => (signal[start + j] = v));
  const histogram: Series = macd.map((m, i) =>
    m === null || signal[i] === null ? null : m - signal[i]!,
  );
  return { macd, signal, histogram };
}

export function naiveStochastic(
  candles: Candle[],
  kPeriod: number,
  smoothK: number,
  dPeriod: number,
) {
  const raw = candles.map((c, i) => {
    if (i < kPeriod - 1) return null;
    const slice = candles.slice(i - kPeriod + 1, i + 1);
    const hh = Math.max(...slice.map((x) => x.high));
    const ll = Math.min(...slice.map((x) => x.low));
    return hh === ll ? 50 : (100 * (c.close - ll)) / (hh - ll);
  });
  const smoothNonNull = (series: Series, period: number): Series => {
    const first = series.findIndex((v) => v !== null);
    const out: Series = series.map(() => null);
    if (first < 0) return out;
    naiveSma(series.slice(first) as number[], period).forEach((v, j) => (out[first + j] = v));
    return out;
  };
  const k = smoothNonNull(raw, smoothK);
  return { k, d: smoothNonNull(k, dPeriod) };
}

export function naiveVwap(candles: Candle[], sessionOf: (time: number) => string | number): Series {
  return candles.map((c, i) => {
    let pv = 0;
    let vol = 0;
    for (let j = i; j >= 0 && sessionOf(candles[j].time) === sessionOf(c.time); j--) {
      const v = Number.isFinite(candles[j].volume) ? candles[j].volume! : 0;
      pv += ((candles[j].high + candles[j].low + candles[j].close) / 3) * v;
      vol += v;
    }
    return vol > 0 ? pv / vol : null;
  });
}

/** Deterministic PRNG (mulberry32) so property tests are reproducible. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hourly random-walk candles around `start`: roughly 5% open gaps, 5% flat bars
 * (high = low = close) and 10% bars without volume, to exercise edge paths.
 */
export function randomCandles(count: number, seed: number, start = 100): Candle[] {
  const rand = mulberry32(seed);
  const candles: Candle[] = [];
  let close = start;
  const t0 = Date.UTC(2026, 0, 1, 5);
  for (let i = 0; i < count; i++) {
    const gap = rand() < 0.05 ? (rand() - 0.5) * 0.1 : 0;
    const open = close * (1 + gap);
    if (rand() < 0.05) {
      candles.push({
        time: t0 + i * 3_600_000,
        open,
        high: open,
        low: open,
        close: open,
        volume: 0,
      });
      close = open;
      continue;
    }
    close = open * (1 + (rand() - 0.5) * 0.04);
    const high = Math.max(open, close) * (1 + rand() * 0.01);
    const low = Math.min(open, close) * (1 - rand() * 0.01);
    const volume = rand() < 0.1 ? undefined : Math.round(rand() * 1000);
    candles.push({ time: t0 + i * 3_600_000, open, high, low, close, volume });
  }
  return candles;
}
