/** Public types of `TradingChart` (OpenSpec add-trading-suite, trading-chart). */
import type { Candle } from "../types.js";

/** How the price series is drawn. */
export type SeriesType = "candles" | "hollow" | "bars" | "line" | "area";

/** Volume histogram: overlaid at the bottom of the price pane, in its own sub-pane, or hidden. */
export type VolumeMode = "overlay" | "pane" | "none";

export type PriceScaleMode = "linear" | "log";

/** Price derived from a bar, used as indicator input. */
export type PriceSource = "open" | "high" | "low" | "close" | "hl2" | "hlc3" | "ohlc4";

export type IndicatorType =
  | "sma"
  | "ema"
  | "wma"
  | "rsi"
  | "bollinger"
  | "atr"
  | "adx"
  | "macd"
  | "stochastic"
  | "vwap";

interface IndicatorBase {
  /** Stable id; defaults to one derived from the type and parameters. */
  id?: string;
  /**
   * `"main"` overlays the price pane; any other id draws the indicator in a
   * sub-pane of that id (indicators sharing an id share the pane). Defaults
   * to `"main"` for moving averages, Bollinger Bands and VWAP, else the type.
   */
  pane?: string;
  /** Colour of the primary line (any CSS colour, var() allowed); defaults to a theme series colour. */
  color?: string;
}

export interface MovingAverageConfig extends IndicatorBase {
  type: "sma" | "ema" | "wma";
  period: number;
  source?: PriceSource;
}

export interface RsiConfig extends IndicatorBase {
  type: "rsi";
  period?: number;
  source?: PriceSource;
  /** Guide levels; default 70 / 30. */
  overbought?: number;
  oversold?: number;
}

export interface BollingerConfig extends IndicatorBase {
  type: "bollinger";
  period?: number;
  /** Band width in standard deviations; default 2. */
  stdDev?: number;
  source?: PriceSource;
}

export interface AtrConfig extends IndicatorBase {
  type: "atr";
  period?: number;
}

export interface AdxConfig extends IndicatorBase {
  type: "adx";
  period?: number;
}

export interface MacdConfig extends IndicatorBase {
  type: "macd";
  fast?: number;
  slow?: number;
  signal?: number;
  source?: PriceSource;
}

export interface StochasticConfig extends IndicatorBase {
  type: "stochastic";
  /** %K look-back; default 14. */
  period?: number;
  /** %K smoothing; default 1 (fast stochastic). */
  smoothK?: number;
  /** %D period; default 3. */
  smoothD?: number;
  overbought?: number;
  oversold?: number;
}

export interface VwapConfig extends IndicatorBase {
  type: "vwap";
}

/** Declarative indicator: `{ type, pane, …params, color? }`. */
export type IndicatorConfig =
  | MovingAverageConfig
  | RsiConfig
  | BollingerConfig
  | AtrConfig
  | AdxConfig
  | MacdConfig
  | StochasticConfig
  | VwapConfig;

/** Visible bars reported by `onrangechange`. */
export interface VisibleRange {
  /** First and last fully or partly visible bar index. */
  from: number;
  to: number;
  fromTime: number;
  toTime: number;
}

/** Hovered or keyboard-selected bar reported by `oncrosshairmove`. */
export interface CrosshairInfo {
  index: number;
  time: number;
  candle: Candle;
  /** Price under the pointer (main pane only, pointer only). */
  price?: number;
  /** Indicator values at the bar, keyed by column header (e.g. "EMA 21"). */
  values: Record<string, number | null>;
  source: "pointer" | "keyboard";
}

/** Every user-visible and assistive string; each key falls back to English. */
export interface TradingChartLabels {
  /** Accessible name of the chart before the summary (default "Price chart"). */
  chart?: string;
  /**
   * Accessible summary template. Placeholders: {chart} {symbol} {interval}
   * {from} {to} {close} {change}. Default:
   * "{chart}: {symbol} {interval}, {from} to {to}. Last close {close} ({change})."
   */
  summary?: string;
  /** Accessible name without data. */
  empty?: string;
  /** Keyboard help, read as the chart's description. */
  keyboardHint?: string;
  /**
   * Live announcement template for the keyboard crosshair. Placeholders:
   * {time} {open} {high} {low} {close} {volume} {indicators}.
   */
  announcement?: string;
  showData?: string;
  hideData?: string;
  /** Table caption; default "Latest {count} bars". */
  tableCaption?: string;
  columns?: Partial<Record<"time" | "open" | "high" | "low" | "close" | "volume", string>>;
  /** Short legend prefixes; default O, H, L, C, V. */
  legend?: Partial<Record<"open" | "high" | "low" | "close" | "volume", string>>;
  /** Default price-line tags per kind; default Entry, TP, SL, Liq. (custom has none). */
  priceLines?: Partial<Record<"entry" | "take-profit" | "stop-loss" | "liquidation", string>>;
  /** Indicator abbreviations (default SMA, EMA, WMA, RSI, BB, ATR, ADX, MACD, Stoch, VWAP). */
  indicators?: Partial<Record<IndicatorType, string>>;
  /** Names of multi-output series (upper, lower, middle, signal, histogram, plusDI, minusDI, k, d). */
  outputs?: Partial<Record<string, string>>;
  /** Legend name of the volume series. */
  volume?: string;
}
