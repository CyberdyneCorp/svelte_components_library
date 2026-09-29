/** Default English strings of `TradingChart` and template filling. */
import type { IndicatorType, TradingChartLabels } from "./types.js";

/** Labels with every key filled in (nested maps too). */
type Resolved<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends object ? Required<NonNullable<T[K]>> : NonNullable<T[K]>;
};

export type ResolvedLabels = Omit<Resolved<TradingChartLabels>, "outputs"> & {
  outputs: Record<string, string>;
};

export const DEFAULT_LABELS: ResolvedLabels = {
  chart: "Price chart",
  summary: "{chart}: {symbol} {interval}, {from} to {to}. Last close {close} ({change}).",
  empty: "Price chart: no data",
  keyboardHint:
    "Arrow keys move the crosshair one bar, Shift+arrows pan, + and − zoom, Home and End jump to the first and last bar.",
  announcement: "{time}: open {open}, high {high}, low {low}, close {close}, volume {volume}{indicators}",
  showData: "Show data",
  hideData: "Hide data",
  tableCaption: "Latest {count} bars",
  columns: { time: "Time", open: "Open", high: "High", low: "Low", close: "Close", volume: "Volume" },
  legend: { open: "O", high: "H", low: "L", close: "C", volume: "V" },
  priceLines: { entry: "Entry", "take-profit": "TP", "stop-loss": "SL", liquidation: "Liq." },
  indicators: {
    sma: "SMA",
    ema: "EMA",
    wma: "WMA",
    rsi: "RSI",
    bollinger: "BB",
    atr: "ATR",
    adx: "ADX",
    macd: "MACD",
    stochastic: "Stoch",
    vwap: "VWAP",
  } satisfies Record<IndicatorType, string>,
  outputs: {
    upper: "Upper",
    middle: "Basis",
    lower: "Lower",
    signal: "Signal",
    histogram: "Histogram",
    plusDI: "+DI",
    minusDI: "−DI",
    k: "%K",
    d: "%D",
  },
  volume: "Volume",
};

/** Overrides merged over the defaults (nested maps merged key by key). */
export function resolveLabels(labels: TradingChartLabels = {}): ResolvedLabels {
  const d = DEFAULT_LABELS;
  return {
    ...d,
    ...stripUndefined(labels),
    columns: { ...d.columns, ...stripUndefined(labels.columns) },
    legend: { ...d.legend, ...stripUndefined(labels.legend) },
    priceLines: { ...d.priceLines, ...stripUndefined(labels.priceLines) },
    indicators: { ...d.indicators, ...stripUndefined(labels.indicators) },
    outputs: { ...d.outputs, ...(stripUndefined(labels.outputs) as Record<string, string>) },
  };
}

function stripUndefined<T extends object>(value: T | undefined): Partial<T> {
  if (!value) return {};
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** Replaces `{name}` placeholders; unknown placeholders are left as they are. */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}
