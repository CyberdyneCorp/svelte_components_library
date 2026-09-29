/**
 * Maps the declarative `indicators` prop to the `trading/indicators`
 * calculators (design D4) and describes how each one is drawn: which
 * outputs exist, whether they are lines or a histogram, band fills, guide
 * levels and fixed scale ranges. The chart only talks to indicators through
 * this table.
 */
import type { Candle } from "../types.js";
import type { IndicatorConfig, IndicatorType, PriceSource } from "./types.js";

/** One output value per key; null or undefined during warm-up. */
export type IndicatorValues = Readonly<Record<string, number | null | undefined>>;

/** Incremental calculator: `next` appends a bar, `update` revises the last one (both O(1)). */
export interface IndicatorCalculator {
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
  create(config: C): IndicatorCalculator;
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

/**
 * Bindings per indicator type. Filled in when `trading/indicators` lands;
 * until then an unknown type is skipped with a warning.
 */
export const INDICATOR_BINDINGS: Partial<Record<IndicatorType, IndicatorBinding<any>>> = {};

export const defaultResolver: BindingResolver = (type) => INDICATOR_BINDINGS[type];
