<svelte:options runes={true} />

<script lang="ts">
  import { onMount, untrack } from "svelte";
  import ChartFrame from "../../charts/ChartFrame/ChartFrame.svelte";
  import type { Candle, ChartMarker, MarketSpec, PriceLine } from "../types.js";
  import { barAnnouncement, chartSummary, chartTable, createThrottle, tableCaption, type ValueColumn } from "./accessibility.js";
  import { ChartEngine } from "./engine/chartEngine.js";
  import { attachInteraction } from "./engine/interaction.js";
  import { handleChartKey } from "./engine/keyboard.js";
  import { observeSize } from "./engine/surface.js";
  import { prefersReducedMotion, watchTheme } from "./engine/theme.js";
  import { inferInterval, TimeFormatter } from "./engine/timeLabels.js";
  import { resolveLabels } from "./labels.js";
  import type {
    CrosshairInfo,
    IndicatorConfig,
    PriceScaleMode,
    SeriesType,
    TradingChartLabels,
    VisibleRange,
    VolumeMode,
  } from "./types.js";

  let {
    candles,
    market,
    seriesType = "candles",
    volume = "overlay",
    scaleMode = "linear",
    indicators = [],
    paneHeights = $bindable(),
    markers = [],
    priceLines = [],
    labels,
    timeZone = "UTC",
    locale,
    interval,
    height = 420,
    tableRows = 50,
    showDataToggle = true,
    class: className = "",
    onrangechange,
    oncrosshairmove,
    onpricelinechange,
    onindicatorerror,
  }: {
    /** Bars in ascending time order. Replace the last bar or append for live updates. */
    candles: Candle[];
    /** Market rules: symbol for the summary, price precision and tick snapping. */
    market?: MarketSpec;
    seriesType?: SeriesType;
    /** Volume histogram at the bottom of the price pane, in its own pane, or hidden. */
    volume?: VolumeMode;
    scaleMode?: PriceScaleMode;
    /** Declarative indicators, e.g. `[{ type: "ema", period: 21 }, { type: "rsi", pane: "rsi" }]`. */
    indicators?: IndicatorConfig[];
    /** Relative pane heights keyed by pane id (`main`, `volume`, sub-pane ids); updated when a separator is dragged. */
    paneHeights?: Record<string, number>;
    markers?: ChartMarker[];
    priceLines?: PriceLine[];
    /** Localizable strings. */
    labels?: TradingChartLabels;
    /** IANA time zone for time labels (default UTC). */
    timeZone?: string;
    /** Locale for numbers and dates (default: the browser's). */
    locale?: string;
    /** Interval name for the summary (e.g. "1h"); inferred from the bar spacing when omitted. */
    interval?: string;
    /** Height of the chart area in CSS pixels. */
    height?: number;
    /** Bars listed in the data table. */
    tableRows?: number;
    showDataToggle?: boolean;
    class?: string;
    onrangechange?: (range: VisibleRange) => void;
    oncrosshairmove?: (info: CrosshairInfo | null) => void;
    /** A draggable price line was dropped at `price` (snapped to `market.tickSize`). */
    onpricelinechange?: (id: string, price: number) => void;
    /** An indicator has invalid parameters or data and was disabled (default: a console warning). */
    onindicatorerror?: (config: IndicatorConfig, error: Error) => void;
  } = $props();

  const ANNOUNCE_WAIT = 300;

  let root: HTMLDivElement;
  let surface: HTMLDivElement;
  let mainCanvas: HTMLCanvasElement;
  let overlayCanvas: HTMLCanvasElement;
  let engine = $state.raw<ChartEngine | null>(null);
  let dataVersion = $state(0);
  let range = $state.raw<VisibleRange | null>(null);
  let announcement = $state("");
  let dataExpanded = $state(false);

  let resolved = $derived(resolveLabels(labels));
  let time = $derived(new TimeFormatter(timeZone, locale));
  let indicatorKey = $derived(JSON.stringify(indicators));

  let a11yContext = $derived.by(() => {
    void dataVersion;
    return {
      candles,
      labels: resolved,
      market,
      locale,
      time,
      interval: interval ?? engine?.barInterval ?? inferInterval((i) => candles[i].time, candles.length),
    };
  });

  let columns = $derived.by<ValueColumn[]>(() => {
    void dataVersion;
    return engine ? engine.store.allSeries().map((s) => ({ header: s.header, values: s.values })) : [];
  });

  let table = $derived(chartTable(a11yContext, columns, tableRows));
  let summary = $derived(chartSummary(a11yContext, range));
  let caption = $derived(tableCaption(resolved, table.rows.length));

  const announcer = createThrottle((text) => (announcement = text), ANNOUNCE_WAIT);

  function handleCrosshair(info: CrosshairInfo | null) {
    oncrosshairmove?.(info);
    if (info?.source === "keyboard") announcer.push(barAnnouncement(a11yContext, info.index, columns));
  }

  onMount(() => {
    const chart = new ChartEngine(root, mainCanvas, overlayCanvas, {
      onrangechange: (next) => {
        range = next;
        onrangechange?.(next);
      },
      oncrosshairmove: handleCrosshair,
      onpricelinechange: (id, price) => onpricelinechange?.(id, price),
      onpaneheightschange: (heights) => (paneHeights = heights),
      ondatachange: () => dataVersion++,
      onindicatorerror: onindicatorerror ? (config, error) => onindicatorerror?.(config, error) : undefined,
    });
    engine = chart;
    const stopSize = observeSize(surface, (size, dpr) => chart.resize(size, dpr));
    const stopTheme = watchTheme(() => chart.refreshTheme());
    const stopInput = attachInteraction(surface, chart, { reducedMotion: prefersReducedMotion });
    return () => {
      stopSize();
      stopTheme();
      stopInput();
      announcer.cancel();
      chart.destroy();
      engine = null;
    };
  });

  $effect(() => {
    engine?.setOptions({ seriesType, volume, scaleMode, market, timeZone, locale, labels: resolved });
  });

  $effect(() => {
    const chart = engine;
    // Track the length and the last bar so in-place mutation of a $state array also updates.
    const last = candles[candles.length - 1];
    void (last && [last.time, last.open, last.high, last.low, last.close, last.volume]);
    const list = candles;
    if (chart) untrack(() => chart.setCandles(list));
  });

  $effect(() => {
    void indicatorKey;
    const chart = engine;
    const list = indicators;
    if (chart) untrack(() => chart.setIndicators(list));
  });

  $effect(() => {
    engine?.setMarkers(markers);
  });

  $effect(() => {
    engine?.setPriceLines(priceLines);
  });

  $effect(() => {
    if (paneHeights) engine?.setPaneHeights(paneHeights);
  });

  function onkeydown(event: KeyboardEvent) {
    if (engine) handleChartKey(engine, event);
  }

  function onblur() {
    if (engine?.currentCrosshair?.source === "keyboard") engine.clearCrosshair();
  }
</script>

<div class="cy-trading-chart {className}" bind:this={root}>
  <ChartFrame
    fallbackLabel={summary}
    description={resolved.keyboardHint}
    hideTitle
    data={table}
    tableCaption={caption}
    {showDataToggle}
    bind:dataExpanded
    showDataLabel={resolved.showData}
    hideDataLabel={resolved.hideData}
  >
    {#snippet children(a11y)}
      <!-- Focusable so the keyboard crosshair works; the canvases are decorative. -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
      <div
        class="cy-trading-chart__surface"
        role="img"
        {...a11y}
        tabindex="0"
        style:height="{height}px"
        bind:this={surface}
        {onkeydown}
        {onblur}
      >
        <canvas class="cy-trading-chart__canvas" aria-hidden="true" bind:this={mainCanvas}></canvas>
        <canvas
          class="cy-trading-chart__canvas cy-trading-chart__canvas--overlay"
          aria-hidden="true"
          bind:this={overlayCanvas}
        ></canvas>
      </div>
      <div class="cy-trading-chart__live" aria-live="polite" aria-atomic="true">{announcement}</div>
    {/snippet}
  </ChartFrame>
</div>

<style>
  .cy-trading-chart {
    /* Canvas colours: read with getComputedStyle, re-read on theme change. */
    --cy-trading-chart-up: var(--color-trade-long, #16a34a);
    --cy-trading-chart-down: var(--color-trade-short, #dc2626);
    --cy-trading-chart-grid: var(--color-border-subtle, #e5e7eb);
    --cy-trading-chart-border: var(--color-border-default, #d1d5db);
    --cy-trading-chart-text: var(--color-text-secondary, #4b5563);
    --cy-trading-chart-text-strong: var(--color-text-primary, #111827);
    --cy-trading-chart-crosshair: var(--color-text-tertiary, #6b7280);
    --cy-trading-chart-label-bg: var(--color-surface-overlay, #374151);
    --cy-trading-chart-label-text: var(--color-text-primary, #f9fafb);
    --cy-trading-chart-inverse-text: var(--color-text-inverse, #ffffff);
    --cy-trading-chart-line: var(--color-action-secondary-default, #0891b2);
    --cy-trading-chart-guide: var(--color-border-strong, #9ca3af);
    --cy-trading-chart-entry: var(--color-text-secondary, #4b5563);
    --cy-trading-chart-take-profit: var(--color-trade-long, #16a34a);
    --cy-trading-chart-stop-loss: var(--color-trade-short, #dc2626);
    --cy-trading-chart-liquidation: var(--color-state-warning, #d97706);
    --cy-trading-chart-custom: var(--color-action-secondary-default, #0891b2);
    --cy-trading-chart-series-1: var(--color-accent-cyan, #0891b2);
    --cy-trading-chart-series-2: var(--color-accent-violet, #7c3aed);
    --cy-trading-chart-series-3: var(--color-state-warning, #d97706);
    --cy-trading-chart-series-4: var(--color-action-brand-default, #16a34a);
    --cy-trading-chart-series-5: var(--color-state-info, #2563eb);
    --cy-trading-chart-series-6: var(--color-text-secondary, #4b5563);
    --cy-trading-chart-font: var(--font-mono, monospace);

    width: 100%;
    font-family: var(--font-body);
  }

  .cy-trading-chart__surface {
    position: relative;
    width: 100%;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    border-radius: var(--radius-sm);
  }

  .cy-trading-chart__surface:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-trading-chart__canvas {
    position: absolute;
    inset: 0;
    display: block;
  }

  .cy-trading-chart__canvas--overlay {
    pointer-events: none;
  }

  .cy-trading-chart__live {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
</style>
