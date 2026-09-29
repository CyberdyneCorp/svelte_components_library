<svelte:options runes={true} />

<script lang="ts">
  import ChartFrame from "../ChartFrame/ChartFrame.svelte";
  import { matrixTable, type ChartLabels } from "../ChartFrame/chartTable.js";
  import { cellRgb, contrastText, rgbCss, type HeatmapColorScale } from "./heatmapColor.js";

  let {
    data = [],
    xLabels = [],
    yLabels = [],
    width = "100%",
    height = "400px",
    colorScale = "green",
    showValues = true,
    title = "",
    description,
    hideTitle = false,
    showDataToggle = true,
    labels = {},
  }: {
    data?: number[][];
    xLabels?: string[];
    yLabels?: string[];
    width?: string;
    height?: string;
    colorScale?: HeatmapColorScale;
    showValues?: boolean;
    /** Chart title, shown above the grid; becomes its accessible name. */
    title?: string;
    description?: string;
    hideTitle?: boolean;
    showDataToggle?: boolean;
    /** Localized strings; each key falls back to English. `columns.row` heads the row-label column. */
    labels?: ChartLabels<"row">;
  } = $props();

  let hoveredCell: { row: number; col: number } | null = $state(null);
  let tooltipPos = $state({ x: 0, y: 0 });

  let rows = $derived(data.length);
  let cols = $derived(data.length > 0 ? data[0].length : 0);

  let flatValues = $derived(data.flat());
  let minVal = $derived(flatValues.length ? Math.min(...flatValues) : 0);
  let maxVal = $derived(flatValues.length ? Math.max(...flatValues) : 1);

  let tableData = $derived(
    rows > 0
      ? matrixTable(data.map((row) => row.map(formatVal)), xLabels, yLabels, labels.columns?.row)
      : undefined,
  );

  function cellStyle(val: number): { background: string; color: string } {
    const rgb = cellRgb(val, colorScale, minVal, maxVal);
    return { background: rgbCss(rgb), color: contrastText(rgb) };
  }

  function formatVal(val: number): string {
    return Number.isInteger(val) ? val.toString() : val.toFixed(2);
  }

  function trackPointer(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).closest(".cy-heatmap")?.getBoundingClientRect();
    if (rect) {
      tooltipPos = { x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 8 };
    }
  }

  function onCellEnter(row: number, col: number, e: MouseEvent) {
    hoveredCell = { row, col };
    trackPointer(e);
  }

  function onCellLeave() {
    hoveredCell = null;
  }

  // Decide if cells are large enough to show values
  let cellLargeEnough = $derived(rows <= 12 && cols <= 12);
</script>

<ChartFrame
  title={title || undefined}
  {description}
  {hideTitle}
  {showDataToggle}
  fallbackLabel={labels.chart ?? "Heatmap"}
  tableCaption={labels.tableCaption}
  showDataLabel={labels.showData}
  hideDataLabel={labels.hideData}
  data={tableData}
>
{#snippet children(a11y)}
<div class="cy-heatmap" style="width: {width}; height: {height};">
  <!-- The grid is one image; the ChartFrame data table is its text alternative. -->
  <div class="cy-heatmap__container" role="img" {...a11y}>
    <!-- Y labels -->
    {#if yLabels.length > 0}
      <div class="cy-heatmap__y-labels">
        {#each yLabels as label}
          <div class="cy-heatmap__y-label">{label}</div>
        {/each}
      </div>
    {/if}

    <div class="cy-heatmap__grid-wrapper">
      <!-- Grid -->
      <div
        class="cy-heatmap__grid"
        style="grid-template-columns: repeat({cols}, 1fr); grid-template-rows: repeat({rows}, 1fr);"
      >
        {#each data as row, ri}
          {#each row as val, ci}
            {@const style = cellStyle(val)}
            <div
              class="cy-heatmap__cell"
              class:cy-heatmap__cell--hovered={hoveredCell?.row === ri && hoveredCell?.col === ci}
              style="background: {style.background};"
              onmouseenter={(e) => onCellEnter(ri, ci, e)}
              onmousemove={trackPointer}
              onmouseleave={onCellLeave}
              role="presentation"
            >
              {#if showValues && cellLargeEnough}
                <span class="cy-heatmap__cell-val" style="color: {style.color}">{formatVal(val)}</span>
              {/if}
            </div>
          {/each}
        {/each}
      </div>

      <!-- X labels -->
      {#if xLabels.length > 0}
        <div class="cy-heatmap__x-labels" style="grid-template-columns: repeat({cols}, 1fr);">
          {#each xLabels as label}
            <div class="cy-heatmap__x-label">{label}</div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Tooltip -->
  {#if hoveredCell}
    <div class="cy-heatmap__tooltip" style="left: {tooltipPos.x}px; top: {tooltipPos.y}px;" aria-hidden="true">
      <span class="cy-heatmap__tooltip-label">
        {#if yLabels[hoveredCell.row] && xLabels[hoveredCell.col]}
          {yLabels[hoveredCell.row]} / {xLabels[hoveredCell.col]}
        {:else}
          [{hoveredCell.row}, {hoveredCell.col}]
        {/if}
      </span>
      <span class="cy-heatmap__tooltip-val">{formatVal(data[hoveredCell.row][hoveredCell.col])}</span>
    </div>
  {/if}
</div>
{/snippet}
</ChartFrame>

<style>
  .cy-heatmap {
    position: relative;
    font-family: var(--font-body);
    display: flex;
    flex-direction: column;
  }


  .cy-heatmap__container {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .cy-heatmap__y-labels {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding-right: var(--space-2);
    flex-shrink: 0;
  }

  .cy-heatmap__y-label {
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .cy-heatmap__grid-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .cy-heatmap__grid {
    display: grid;
    flex: 1;
    gap: 1px;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .cy-heatmap__cell {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 150ms ease;
    min-width: 0;
    min-height: 0;
  }

  .cy-heatmap__cell--hovered {
    opacity: 0.8;
    outline: 1px solid var(--color-text-tertiary);
    outline-offset: -1px;
    z-index: 1;
  }

  .cy-heatmap__cell-val {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    line-height: 1;
    user-select: none;
  }

  .cy-heatmap__x-labels {
    display: grid;
    padding-top: var(--space-2);
  }

  .cy-heatmap__x-label {
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    text-align: center;
  }

  .cy-heatmap__tooltip {
    position: absolute;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    padding: 4px 8px;
    font-size: 0.75rem;
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .cy-heatmap__tooltip-label {
    color: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-heatmap__tooltip-val {
    color: var(--color-text-primary);
    font-family: var(--font-mono);
    font-weight: 600;
  }
</style>
