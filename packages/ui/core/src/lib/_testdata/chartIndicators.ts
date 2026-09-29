/**
 * Minimal indicator bindings for chart tests: a close-price SMA overlay, a
 * band overlay and an oscillator sub-pane with a histogram, guides and a
 * fixed range. They count calculator calls so tests can prove updates are
 * incremental.
 */
import type { Candle } from "../trading/types.js";
import type { BindingResolver, IndicatorBinding, IndicatorCalculator } from "../trading/chart/indicatorBindings.js";

export interface CallCounter {
  created: number;
  next: number;
  update: number;
}

/** Simple moving average of closes with next / update. */
function smaCalculator(period: number, counter: CallCounter): IndicatorCalculator {
  const window: number[] = [];
  counter.created++;
  const value = () => (window.length === period ? window.reduce((a, b) => a + b, 0) / period : null);
  return {
    next(candle: Candle) {
      counter.next++;
      window.push(candle.close);
      if (window.length > period) window.shift();
      return { value: value() };
    },
    update(candle: Candle) {
      counter.update++;
      window[window.length - 1] = candle.close;
      return { value: value() };
    },
  };
}

export function fakeBindings(counter: CallCounter = { created: 0, next: 0, update: 0 }) {
  const sma: IndicatorBinding<any> = {
    overlay: true,
    params: (c) => [c.period],
    outputs: [{ key: "value", style: "line" }],
    create: (c) => smaCalculator(c.period, counter),
  };
  const bollinger: IndicatorBinding<any> = {
    overlay: true,
    params: (c) => [c.period ?? 3],
    outputs: [
      { key: "middle", style: "line", name: "middle" },
      { key: "upper", style: "line", name: "upper" },
      { key: "lower", style: "line", name: "lower" },
    ],
    band: ["upper", "lower"],
    create: (c) => {
      const inner = smaCalculator(c.period ?? 3, counter);
      const wrap = (out: { value: number | null | undefined }) =>
        out.value == null ? {} : { middle: out.value, upper: out.value + 1, lower: out.value - 1 };
      return { next: (k) => wrap(inner.next(k) as never), update: (k) => wrap(inner.update(k) as never) };
    },
  };
  const rsi: IndicatorBinding<any> = {
    overlay: false,
    params: (c) => [c.period ?? 14],
    outputs: [
      { key: "value", style: "line" },
      { key: "histogram", style: "histogram", name: "histogram" },
    ],
    guides: (c) => [c.oversold ?? 30, c.overbought ?? 70],
    range: [0, 100],
    create: () => {
      counter.created++;
      const out = (k: Candle) => ({ value: (k.close % 100 + 100) % 100, histogram: k.close - k.open });
      return {
        next: (k) => (counter.next++, out(k)),
        update: (k) => (counter.update++, out(k)),
      };
    },
  };
  const macd: IndicatorBinding<any> = {
    overlay: false,
    params: () => [12, 26, 9],
    outputs: [{ key: "value", style: "line" }],
    includeZero: true,
    create: () => ({ next: (k) => ({ value: k.close - k.open + 50 }), update: (k) => ({ value: k.close - k.open + 50 }) }),
  };
  const table: Record<string, IndicatorBinding<any>> = { sma, ema: sma, bollinger, rsi, macd };
  const resolver: BindingResolver = (type) => table[type];
  return { resolver, counter, table };
}
