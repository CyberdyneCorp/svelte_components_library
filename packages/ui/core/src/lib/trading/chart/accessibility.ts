/**
 * Accessible fallback of the canvas chart (design D6): the named-image
 * summary, the keyboard-crosshair announcement and the data table of the
 * latest bars with the active indicator values.
 */
import type { ChartTableData } from "../../charts/ChartFrame/chartTable.js";
import type { Candle, MarketSpec, PriceLine } from "../types.js";
import type { PriceLineEdit } from "./engine/priceLineEditor.js";
import { autoDigits, fixedFormatter, percentFormatter, priceDigits, volumeFormatter } from "./engine/numberFormat.js";
import type { TimeFormatter } from "./engine/timeLabels.js";
import { intervalName } from "./engine/timeLabels.js";
import { fillTemplate, type ResolvedLabels } from "./labels.js";
import type { VisibleRange } from "./types.js";

/** An indicator column: header plus values aligned with the candles (NaN = none). */
export interface ValueColumn {
  header: string;
  values: readonly number[];
}

export interface A11yContext {
  candles: readonly Candle[];
  labels: ResolvedLabels;
  market?: MarketSpec;
  locale?: string;
  time: TimeFormatter;
  /** Bar duration in ms (for the interval name) or an explicit interval name. */
  interval: number | string;
}

function priceFormat(ctx: A11yContext) {
  const last = ctx.candles[ctx.candles.length - 1];
  return fixedFormatter(priceDigits(ctx.market, last?.close ?? 0), ctx.locale);
}

/** "Price chart: BTC-PERP 1h, 12 Mar 2026, 08:00 to …. Last close 64,123.50 (+1.23%)." */
export function chartSummary(ctx: A11yContext, range: VisibleRange | null): string {
  const { candles, labels } = ctx;
  if (candles.length === 0) return labels.empty;
  const from = range?.from ?? 0;
  const to = range?.to ?? candles.length - 1;
  const first = candles[from];
  const last = candles[to];
  const change = first.open ? (last.close - first.open) / first.open : NaN;
  return fillTemplate(labels.summary, {
    chart: labels.chart,
    symbol: ctx.market?.symbol ?? "",
    interval: typeof ctx.interval === "string" ? ctx.interval : intervalName(ctx.interval),
    from: ctx.time.format(first.time, "full"),
    to: ctx.time.format(last.time, "full"),
    close: priceFormat(ctx)(last.close),
    change: percentFormatter(ctx.locale)(change),
  })
    .replace(/\s+,/g, ",")
    .replace(/:\s+/, ": ")
    .replace(/\s{2,}/g, " ");
}

/** Live-region text for the bar at `index`, with indicator values. */
export function barAnnouncement(ctx: A11yContext, index: number, columns: readonly ValueColumn[]): string {
  const candle = ctx.candles[index];
  if (!candle) return "";
  const price = priceFormat(ctx);
  const indicators = columns
    .map((column) => [column.header, formatValue(column.values[index], ctx.locale)] as const)
    .filter(([, value]) => value !== "")
    .map(([header, value]) => `, ${header} ${value}`)
    .join("");
  return fillTemplate(ctx.labels.announcement, {
    time: ctx.time.format(candle.time, "full"),
    open: price(candle.open),
    high: price(candle.high),
    low: price(candle.low),
    close: price(candle.close),
    volume: candle.volume === undefined ? "—" : volumeFormatter(ctx.locale)(candle.volume),
    indicators,
  });
}

/** Spoken name of a price line: its label, else its kind tag, else the generic name. */
export function priceLineName(labels: ResolvedLabels, line: PriceLine): string {
  const kind = line.kind ?? "custom";
  const tag = kind === "custom" ? "" : labels.priceLines[kind];
  return line.label || tag || labels.priceLine;
}

/** Live-region text for a keyboard price-line edit step. */
export function priceLineAnnouncement(ctx: A11yContext, edit: PriceLineEdit): string {
  return fillTemplate(ctx.labels.priceLineEdit[edit.phase], {
    line: priceLineName(ctx.labels, edit.line),
    price: priceFormat(ctx)(edit.price),
  });
}

/** Chart description: the keyboard help, plus the price-line help when a line is draggable. */
export function keyboardDescription(labels: ResolvedLabels, draggableLines: boolean): string {
  return draggableLines ? `${labels.keyboardHint} ${labels.priceLineHint}` : labels.keyboardHint;
}

function formatValue(value: number | undefined, locale?: string): string {
  if (value === undefined || !Number.isFinite(value)) return "";
  return fixedFormatter(autoDigits(value), locale)(value);
}

/** Newest-first table of the latest `rows` bars: time, OHLCV, then one column per indicator output. */
export function chartTable(ctx: A11yContext, columns: readonly ValueColumn[], rows = 50): ChartTableData {
  const { candles, labels } = ctx;
  const price = priceFormat(ctx);
  const header = [
    labels.columns.time,
    labels.columns.open,
    labels.columns.high,
    labels.columns.low,
    labels.columns.close,
    labels.columns.volume,
    ...columns.map((column) => column.header),
  ];
  const body: (string | number)[][] = [];
  for (let i = candles.length - 1; i >= Math.max(0, candles.length - rows); i--) {
    const c = candles[i];
    body.push([
      ctx.time.format(c.time, "full"),
      price(c.open),
      price(c.high),
      price(c.low),
      price(c.close),
      c.volume === undefined ? "" : fixedFormatter(0, ctx.locale)(c.volume),
      ...columns.map((column) => formatValue(column.values[i], ctx.locale)),
    ]);
  }
  return { columns: header, rows: body };
}

/** Table caption with the row count filled in. */
export function tableCaption(labels: ResolvedLabels, rows: number): string {
  return fillTemplate(labels.tableCaption, { count: rows });
}

/**
 * Throttles announcements: the first call speaks at once, later calls
 * within `wait` ms collapse into one trailing call with the latest text.
 */
export function createThrottle(
  speak: (text: string) => void,
  wait: number,
  // Wrapped: browsers throw "Illegal invocation" when setTimeout is called as a method of another object.
  timers: { set: (fn: () => void, ms: number) => unknown; clear: (id: never) => void } = {
    set: (fn, ms) => setTimeout(fn, ms),
    clear: (id) => clearTimeout(id),
  },
) {
  let last = -Infinity;
  let pending: string | null = null;
  let timer: unknown = null;
  const fire = () => {
    timer = null;
    last = Date.now();
    if (pending !== null) speak(pending);
    pending = null;
  };
  return {
    push(text: string) {
      pending = text;
      const elapsed = Date.now() - last;
      if (elapsed >= wait && timer === null) fire();
      else timer ??= timers.set(fire, Math.max(0, wait - elapsed));
    },
    cancel() {
      if (timer !== null) timers.clear(timer as never);
      timer = null;
      pending = null;
    },
  };
}
