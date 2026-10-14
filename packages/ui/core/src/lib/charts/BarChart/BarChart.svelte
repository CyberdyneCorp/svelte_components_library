<svelte:options runes={true} />

<script lang="ts">
  import ChartFrame from "../ChartFrame/ChartFrame.svelte";
  import ChartLegend from "../ChartLegend/ChartLegend.svelte";
  import { markerPath, seriesStyle } from "../ChartLegend/markers.js";
  import { categoryTable, columnHeaders, type ChartLabels, type ChartTableData } from "../ChartFrame/chartTable.js";
  import {
    dataMatrix,
    layoutBars,
    rectMarker,
    seriesMatrix,
    type BarDatum,
    type BarRect,
    type BarSeries,
  } from "./barLayout.js";

  let {
    data = [],
    series = [],
    stacked = false,
    width = "100%",
    height = "300px",
    horizontal = false,
    showValues = true,
    showGrid = true,
    animate = true,
    barColor = "#00ff41",
    title,
    description,
    hideTitle = false,
    showDataToggle = true,
    labels = {},
  }: {
    data?: BarDatum[];
    /** Multi-series data; takes precedence over `data` when non-empty. */
    series?: BarSeries[];
    /** Stack series within each category instead of placing them side by side. */
    stacked?: boolean;
    width?: string;
    height?: string;
    horizontal?: boolean;
    showValues?: boolean;
    showGrid?: boolean;
    animate?: boolean;
    barColor?: string;
    title?: string;
    description?: string;
    hideTitle?: boolean;
    showDataToggle?: boolean;
    /** Localized strings; each key falls back to English. */
    labels?: ChartLabels<"label" | "value">;
  } = $props();

  const viewW = 600;
  const viewH = 300;
  const defaultColors = ["#00ff41", "#00d4ff", "#bf5af2", "#ffb800"];

  let padding = $derived(horizontal
    ? { top: 20, right: 40, bottom: 30, left: 80 }
    : { top: 20, right: 20, bottom: 50, left: 50 });

  let multi = $derived(series.length > 0);
  let seriesColors = $derived(series.map((s, i) => s.color || defaultColors[i % defaultColors.length]));
  let matrix = $derived(multi ? seriesMatrix(series) : dataMatrix(data));

  let layout = $derived(
    layoutBars({
      ...matrix,
      colors: multi ? seriesColors : data.map((d) => d.color || barColor),
      perCategoryColors: !multi,
      stacked: multi && stacked,
      horizontal,
      plot: {
        left: padding.left,
        top: padding.top,
        width: viewW - padding.left - padding.right,
        height: viewH - padding.top - padding.bottom,
      },
    }),
  );

  let showLegend = $derived(series.length >= 2);
  let legendItems = $derived(
    series.map((s, i) => ({ label: s.name, color: seriesColors[i], marker: seriesStyle(i).marker })),
  );

  let hoveredIndex: number | null = $state(null);

  function markerD(rect: BarRect): string | null {
    const m = showLegend ? rectMarker(rect) : null;
    return m ? markerPath(seriesStyle(rect.seriesIndex).marker, m.cx, m.cy, m.size) : null;
  }

  function multiTable(labelHeader: string): ChartTableData {
    return {
      columns: [labelHeader, ...series.map((s) => s.name)],
      rows: matrix.categories.map((c, ci) => [c, ...matrix.values.map((row) => row[ci])]),
    };
  }

  let tableData = $derived.by(() => {
    const [labelHeader, valueHeader] = columnHeaders({ label: "Label", value: "Value" }, labels.columns);
    return multi ? multiTable(labelHeader) : categoryTable(data, labelHeader, valueHeader);
  });
</script>

<ChartFrame
  {title}
  {description}
  {hideTitle}
  {showDataToggle}
  fallbackLabel={labels.chart ?? "Bar chart"}
  tableCaption={labels.tableCaption}
  showDataLabel={labels.showData}
  hideDataLabel={labels.hideData}
  data={tableData}
>
{#snippet children(a11y)}
<div class="cy-bar-chart" class:cy-bar-chart--legend={showLegend} style="width: {width}; height: {height};">
  <svg
    {...a11y}
    viewBox="0 0 {viewW} {viewH}"
    preserveAspectRatio="xMidYMid meet"
    class="cy-bar-chart__svg"
    role="img"
  >
    {#if showGrid}
      {#each layout.ticks as tick, i (i)}
        <line {...tick.line} class="cy-bar-chart__grid" />
      {/each}
    {/if}

    <!-- Axis lines -->
    {#each layout.axes as axis, i (i)}
      <line {...axis} class="cy-bar-chart__axis" />
    {/each}

    <!-- Tick labels for value axis -->
    {#each layout.ticks as tick, i (i)}
      <text x={tick.label.x} y={tick.label.y} class="cy-bar-chart__tick" text-anchor={tick.label.anchor}>{tick.label.text}</text>
    {/each}

    <!-- Bars -->
    {#each layout.rects as rect, i (i)}
      {@const isHovered = hoveredIndex === i}
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        fill={rect.color}
        opacity={isHovered ? 1 : 0.85}
        class="cy-bar-chart__bar"
        class:cy-bar-chart__bar--animated={animate}
        style={isHovered ? `filter: drop-shadow(0 0 8px ${rect.color})` : ""}
        data-series={multi ? rect.seriesIndex : undefined}
        onmouseenter={() => hoveredIndex = i}
        onmouseleave={() => hoveredIndex = null}
        role="presentation"
      />
    {/each}

    {#each layout.rects as rect, i (i)}
      {@const d = markerD(rect)}
      {#if d}
        <path {d} class="cy-bar-chart__marker" data-marker={seriesStyle(rect.seriesIndex).marker} />
      {/if}
    {/each}

    {#each layout.categoryLabels as label, i (i)}
      <text x={label.x} y={label.y} class="cy-bar-chart__label" text-anchor={label.anchor}>{label.text}</text>
    {/each}

    {#if showValues}
      {#each layout.valueLabels as label, i (i)}
        <text x={label.x} y={label.y} class="cy-bar-chart__value" text-anchor={label.anchor}>{label.text}</text>
      {/each}
    {/if}
  </svg>

  {#if showLegend}
    <ChartLegend items={legendItems} ariaLabel={labels.legend} blockClass="cy-bar-chart" />
  {/if}
</div>
{/snippet}
</ChartFrame>

<style>
  .cy-bar-chart {
    position: relative;
    font-family: var(--font-body);
  }

  .cy-bar-chart__svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  /* With a legend the SVG takes the height left over below it. */
  .cy-bar-chart--legend {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .cy-bar-chart--legend .cy-bar-chart__svg {
    flex: 1 1 auto;
    min-height: 0;
  }

  .cy-bar-chart__grid {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-bar-chart__axis {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-bar-chart__tick {
    font-size: 9px;
    fill: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }

  .cy-bar-chart__bar {
    transition: opacity 150ms ease, filter 150ms ease;
    rx: 2;
  }

  .cy-bar-chart__bar--animated {
    animation: cy-bar-grow 0.8s ease-out forwards;
  }

  @keyframes cy-bar-grow {
    from { opacity: 0; }
    to { opacity: 0.85; }
  }

  .cy-bar-chart__label {
    font-size: 9px;
    fill: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-bar-chart__marker {
    fill: var(--color-surface-default);
    pointer-events: none;
  }

  .cy-bar-chart__value {
    font-size: 9px;
    fill: var(--color-text-primary);
    font-family: var(--font-mono);
  }
</style>
