/**
 * Maps the declarative `indicators` prop to the `trading/indicators`
 * incremental calculators (design D4) and describes how each one is drawn:
 * its outputs, whether they are lines or a histogram, band fills, guide
 * levels and fixed scale ranges. The chart only talks to indicators through
 * this table.
 */
import {
  createADX,
  createATR,
  createBollinger,
  createEMA,
  createMACD,
  createRSI,
  createSMA,
  createStochastic,
  createVWAP,
  createWMA,
  type IndicatorCalculator,
} from "../indicators/index.js";
import type { Candle } from "../types.js";
import type {
  AdxConfig,
  AtrConfig,
  BollingerConfig,
  IndicatorConfig,
  IndicatorType,
  MacdConfig,
  MovingAverageConfig,
  PriceSource,
  RsiConfig,
  StochasticConfig,
  VwapConfig,
} from "./types.js";

/** One output value per key; null or undefined during warm-up. */
export type IndicatorValues = Readonly<Record<string, number | null | undefined>>;

/** A calculator fed with candles, returning named outputs (`next` appends, `update` revises the last bar). */
export interface ChartCalculator {
  next(candle: Candle): IndicatorValues;
  update(candle: Candle): IndicatorValues;
}

export interface OutputSpec {
  /** Key in IndicatorValues. */
  key: string;
  style: "line" | "histogram";
  /** Name appended to the indicator title for multi-output indicators (a `labels.outputs` key). */
  name?: string;
}

export interface IndicatorBinding<C extends IndicatorConfig = IndicatorConfig> {
  /** Drawn on the price pane unless `pane` says otherwise. */
  overlay: boolean;
  /** Parameters shown in the title, e.g. [21] → "EMA 21". */
  params(config: C): (number | string)[];
  outputs: readonly OutputSpec[];
  /** Keys of two outputs to fill between (Bollinger Bands). */
  band?: readonly [upper: string, lower: string];
  /** Horizontal guide levels (RSI 30 / 70). */
  guides?(config: C): number[];
  /** Fixed scale range instead of auto-fit (oscillators). */
  range?: readonly [number, number];
  /** Keep zero inside the auto-fitted range (MACD). */
  includeZero?: boolean;
  /** Creates the calculator; throws RangeError on invalid parameters. */
  create(config: C): ChartCalculator;
}

export type BindingResolver = (type: IndicatorType) => IndicatorBinding | undefined;

/** Price of a bar for a `source`. */
export function sourceValue(candle: Candle, source: PriceSource = "close"): number {
  switch (source) {
    case "open":
      return candle.open;
    case "high":
      return candle.high;
    case "low":
      return candle.low;
    case "hl2":
      return (candle.high + candle.low) / 2;
    case "hlc3":
      return (candle.high + candle.low + candle.close) / 3;
    case "ohlc4":
      return (candle.open + candle.high + candle.low + candle.close) / 4;
    default:
      return candle.close;
  }
}

/** Adapts an indicator calculator to candles in and named outputs out. */
function adapt<I, O>(
  calc: IndicatorCalculator<I, O>,
  input: (candle: Candle) => I,
  output: (value: O) => IndicatorValues,
): ChartCalculator {
  return {
    next: (candle) => output(calc.next(input(candle))),
    update: (candle) => output(calc.update(input(candle))),
  };
}

const single = (value: number | null): IndicatorValues => ({ value });
const byObject = <O extends object>(value: O) => value as unknown as IndicatorValues;
const candleInput = (candle: Candle) => candle;
const sourceInput = (source?: PriceSource) => (candle: Candle) => sourceValue(candle, source);

const VALUE_LINE: readonly OutputSpec[] = [{ key: "value", style: "line" }];
const OSCILLATOR_RANGE = [0, 100] as const;

function movingAverage(
  factory: (period: number) => IndicatorCalculator<number, number | null>,
): IndicatorBinding<MovingAverageConfig> {
  return {
    overlay: true,
    params: (c) => [c.period],
    outputs: VALUE_LINE,
    create: (c) => adapt(factory(c.period), sourceInput(c.source), single),
  };
}

const rsiBinding: IndicatorBinding<RsiConfig> = {
  overlay: false,
  params: (c) => [c.period ?? 14],
  outputs: VALUE_LINE,
  guides: (c) => [c.oversold ?? 30, c.overbought ?? 70],
  range: OSCILLATOR_RANGE,
  create: (c) => adapt(createRSI(c.period ?? 14), sourceInput(c.source), single),
};

const bollingerBinding: IndicatorBinding<BollingerConfig> = {
  overlay: true,
  params: (c) => [c.period ?? 20, c.stdDev ?? 2],
  outputs: [
    { key: "middle", style: "line", name: "middle" },
    { key: "upper", style: "line", name: "upper" },
    { key: "lower", style: "line", name: "lower" },
  ],
  band: ["upper", "lower"],
  create: (c) =>
    adapt(createBollinger({ period: c.period, stdDev: c.stdDev }), sourceInput(c.source), byObject),
};

const atrBinding: IndicatorBinding<AtrConfig> = {
  overlay: false,
  params: (c) => [c.period ?? 14],
  outputs: VALUE_LINE,
  create: (c) => adapt(createATR(c.period ?? 14), candleInput, single),
};

const adxBinding: IndicatorBinding<AdxConfig> = {
  overlay: false,
  params: (c) => [c.period ?? 14],
  outputs: [
    { key: "adx", style: "line" },
    { key: "plusDI", style: "line", name: "plusDI" },
    { key: "minusDI", style: "line", name: "minusDI" },
  ],
  create: (c) => adapt(createADX(c.period ?? 14), candleInput, byObject),
};

const macdBinding: IndicatorBinding<MacdConfig> = {
  overlay: false,
  params: (c) => [c.fastPeriod ?? 12, c.slowPeriod ?? 26, c.signalPeriod ?? 9],
  outputs: [
    { key: "histogram", style: "histogram", name: "histogram" },
    { key: "macd", style: "line" },
    { key: "signal", style: "line", name: "signal" },
  ],
  includeZero: true,
  create: (c) =>
    adapt(
      createMACD({ fastPeriod: c.fastPeriod, slowPeriod: c.slowPeriod, signalPeriod: c.signalPeriod }),
      sourceInput(c.source),
      byObject,
    ),
};

const stochasticBinding: IndicatorBinding<StochasticConfig> = {
  overlay: false,
  params: (c) => [c.kPeriod ?? 14, c.smoothK ?? 1, c.dPeriod ?? 3],
  outputs: [
    { key: "k", style: "line", name: "k" },
    { key: "d", style: "line", name: "d" },
  ],
  guides: (c) => [c.oversold ?? 20, c.overbought ?? 80],
  range: OSCILLATOR_RANGE,
  create: (c) =>
    adapt(createStochastic({ kPeriod: c.kPeriod, smoothK: c.smoothK, dPeriod: c.dPeriod }), candleInput, byObject),
};

const vwapBinding: IndicatorBinding<VwapConfig> = {
  overlay: true,
  params: () => [],
  outputs: VALUE_LINE,
  create: (c) => adapt(createVWAP({ session: c.session }), candleInput, single),
};

/** Binding per indicator type (every function in `trading/indicators`). */
export const INDICATOR_BINDINGS: Record<IndicatorType, IndicatorBinding<any>> = {
  sma: movingAverage(createSMA),
  ema: movingAverage(createEMA),
  wma: movingAverage(createWMA),
  rsi: rsiBinding,
  bollinger: bollingerBinding,
  atr: atrBinding,
  adx: adxBinding,
  macd: macdBinding,
  stochastic: stochasticBinding,
  vwap: vwapBinding,
};

export const defaultResolver: BindingResolver = (type) => INDICATOR_BINDINGS[type];
