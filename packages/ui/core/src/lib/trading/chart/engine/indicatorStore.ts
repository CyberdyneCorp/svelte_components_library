/**
 * Indicator values for the chart (design D3 / D4). Values are computed once
 * per data change by feeding the incremental calculators; a replaced last
 * bar or appended bars only touch the tail, never the whole series.
 *
 * Invalid parameters or data make a calculator throw RangeError. That
 * indicator is then disabled (no values, reported through `onerror`) and
 * the chart keeps rendering.
 */
import type { Candle } from "../../types.js";
import type { BindingResolver, ChartCalculator, IndicatorBinding, IndicatorValues, OutputSpec } from "../indicatorBindings.js";
import type { ResolvedLabels } from "../labels.js";
import type { IndicatorConfig } from "../types.js";
import type { SeriesChange } from "./series.js";

export const MAIN_PANE = "main";

export interface IndicatorSeries {
  spec: OutputSpec;
  /** Column / legend header, e.g. "EMA 21" or "MACD 12 26 9 Signal". */
  header: string;
  /** Explicit colour (primary output only) or undefined for the palette. */
  color?: string;
  /** Palette slot within the pane. */
  slot: number;
  /** Aligned with the candles; NaN during warm-up. */
  values: number[];
}

export interface IndicatorInstance {
  id: string;
  config: IndicatorConfig;
  binding: IndicatorBinding;
  pane: string;
  /** "EMA 21", "MACD 12 26 9". */
  title: string;
  series: IndicatorSeries[];
  calc: ChartCalculator | null;
  /** Set when the calculator threw; the indicator has no values then. */
  error?: Error;
}

export type IndicatorErrorHandler = (config: IndicatorConfig, error: Error) => void;

const warned = new Set<string>();

function warnOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(`TradingChart: ${message}`);
}

const toNumber = (value: number | null | undefined) => (typeof value === "number" ? value : NaN);

function titleOf(config: IndicatorConfig, binding: IndicatorBinding, labels: ResolvedLabels): string {
  return [labels.indicators[config.type] ?? config.type, ...binding.params(config)].join(" ");
}

function headerOf(title: string, spec: OutputSpec, labels: ResolvedLabels): string {
  return spec.name ? `${title} ${labels.outputs[spec.name] ?? spec.name}` : title;
}

function write(instance: IndicatorInstance, index: number, values: IndicatorValues): void {
  for (const series of instance.series) series.values[index] = toNumber(values[series.spec.key]);
}

export class IndicatorStore {
  instances: IndicatorInstance[] = [];
  /** Bumped whenever values change. */
  version = 0;

  constructor(
    private readonly resolve: BindingResolver,
    private readonly onerror: IndicatorErrorHandler = (config, error) =>
      warnOnce(`indicator "${config.type}" disabled: ${error.message}`),
  ) {}

  /** Builds the instances for `configs` and computes them over `candles`. */
  configure(configs: readonly IndicatorConfig[], labels: ResolvedLabels, candles: readonly Candle[]): void {
    const slots = new Map<string, number>();
    this.instances = [];
    for (const config of configs) {
      const binding = this.resolve(config.type);
      if (binding) this.instances.push(this.instantiate(config, binding, labels, slots));
      else warnOnce(`unknown indicator type "${config.type}" was skipped`);
    }
    this.recompute(candles);
  }

  private instantiate(
    config: IndicatorConfig,
    binding: IndicatorBinding,
    labels: ResolvedLabels,
    slots: Map<string, number>,
  ): IndicatorInstance {
    const pane = config.pane ?? (binding.overlay ? MAIN_PANE : config.type);
    const title = titleOf(config, binding, labels);
    const series = binding.outputs.map((spec, i) => {
      const slot = slots.get(pane) ?? 0;
      slots.set(pane, slot + 1);
      return { spec, header: headerOf(title, spec, labels), color: i === 0 ? config.color : undefined, slot, values: [] };
    });
    const id = config.id ?? `${config.type}:${pane}:${title}`;
    return { id, config, binding, pane, title, series, calc: null };
  }

  /** Full recomputation with fresh calculators. */
  recompute(candles: readonly Candle[]): void {
    for (const instance of this.instances) {
      for (const series of instance.series) series.values = [];
      instance.error = undefined;
      this.guard(instance, () => {
        const calc = instance.binding.create(instance.config);
        instance.calc = calc;
        for (let i = 0; i < candles.length; i++) write(instance, i, calc.next(candles[i]));
      });
    }
    this.version++;
  }

  /** Applies a live change incrementally (O(1) per indicator per bar). */
  apply(change: SeriesChange, candles: readonly Candle[]): void {
    if (change.kind === "reset") {
      this.recompute(candles);
      return;
    }
    const firstNew = change.kind === "append" ? candles.length - change.count : candles.length;
    for (const instance of this.instances) {
      const calc = instance.calc;
      if (!calc || instance.error) continue;
      this.guard(instance, () => {
        write(instance, firstNew - 1, calc.update(candles[firstNew - 1]));
        for (let i = firstNew; i < candles.length; i++) write(instance, i, calc.next(candles[i]));
      });
    }
    this.version++;
  }

  /** Runs `work`; on an error the instance is disabled and the error reported. */
  private guard(instance: IndicatorInstance, work: () => void): void {
    try {
      work();
    } catch (error) {
      instance.error = error instanceof Error ? error : new Error(String(error));
      instance.calc = null;
      for (const series of instance.series) series.values = [];
      this.onerror(instance.config, instance.error);
    }
  }

  /** Sub-pane ids in order of first appearance. */
  subPanes(): string[] {
    return [...new Set(this.instances.map((i) => i.pane).filter((pane) => pane !== MAIN_PANE))];
  }

  inPane(pane: string): IndicatorInstance[] {
    return this.instances.filter((instance) => instance.pane === pane);
  }

  /** Every output series, in configuration order. */
  allSeries(): IndicatorSeries[] {
    return this.instances.flatMap((instance) => instance.series);
  }
}
