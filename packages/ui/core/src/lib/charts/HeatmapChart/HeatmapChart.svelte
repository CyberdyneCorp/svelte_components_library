<svelte:options runes={true} />

<script lang="ts">
  let {
    data = [],
    xLabels = [],
    yLabels = [],
    width = "100%",
    height = "400px",
    colorScale = "green",
    showValues = true,
    title = "",
  }: {
    data?: number[][];
    xLabels?: string[];
    yLabels?: string[];
    width?: string;
    height?: string;
    colorScale?: "green" | "cyan" | "diverging";
    showValues?: boolean;
    title?: string;
  } = $props();

  let hoveredCell: { row: number; col: number } | null = $state(null);
  let tooltipPos = $state({ x: 0, y: 0 });

  let rows = $derived(data.length);
  let cols = $derived(data.length > 0 ? data[0].length : 0);

  let flatValues = $derived(data.flat());
  let minVal = $derived(flatValues.length ? Math.min(...flatValues) : 0);
  let maxVal = $derived(flatValues.length ? Math.max(...flatValues) : 1);
  let valRange = $derived(maxVal - minVal || 1);

  function normalize(val: number): number {
    return (val - minVal) / valRange;
  }

  function cellColor(val: number): string {
    if (colorScale === "diverging") {
      // -1 to 1 range assumed, map through red -> black -> green
      const absMax = Math.max(Math.abs(minVal), Math.abs(maxVal)) || 1;
      const norm = val / absMax; // -1 to 1
      if (norm >= 0) {
        const t = norm;
        const g = Math.round(t * 255);
        return `rgb(0, ${g}, ${Math.round(t * 65)})`;
      } else {
        const t = -norm;
        const r = Math.round(t * 255);
        return `rgb(${r}, ${Math.round(t * 30)}, ${Math.round(t * 30)})`;
      }
    }

    const t = normalize(val);
    if (colorScale === "cyan") {
      const r = Math.round(t * 0);
      const g = Math.round(t * 212);
      const b = Math.round(t * 255);
      return `rgb(${r}, ${g}, ${b})`;
    }

    // green
    const r = Math.round(t * 0);
    const g = Math.round(t * 255);
    const b = Math.round(t * 65);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function textColor(val: number): string {
    const t = colorScale === "diverging"
      ? Math.abs(val) / (Math.max(Math.abs(minVal), Math.abs(maxVal)) || 1)
      : normalize(val);
    return t > 0.5 ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.7)";
  }

  function formatVal(val: number): string {
    return Number.isInteger(val) ? val.toString() : val.toFixed(2);
  }

  function onCellEnter(row: number, col: number, e: MouseEvent) {
    hoveredCell = { row, col };
    const rect = (e.currentTarget as HTMLElement).closest(".cy-heatmap")?.getBoundingClientRect();
    if (rect) {
      tooltipPos = { x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 8 };
    }
  }

  function onCellMove(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).closest(".cy-heatmap")?.getBoundingClientRect();
    if (rect) {
      tooltipPos = { x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 8 };
    }
  }

  function onCellLeave() {
    hoveredCell = null;
  }

  // Decide if cells are large enough to show values
  let cellLargeEnough = $derived(rows <= 12 && cols <= 12);
</script>

<div class="cy-heatmap" style="width: {width}; height: {height};">
  {#if title}
    <div class="cy-heatmap__title">{title}</div>
  {/if}

  <div class="cy-heatmap__container">
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
            <div
              class="cy-heatmap__cell"
              class:cy-heatmap__cell--hovered={hoveredCell?.row === ri && hoveredCell?.col === ci}
              style="background: {cellColor(val)};"
              onmouseenter={(e) => onCellEnter(ri, ci, e)}
              onmousemove={onCellMove}
              onmouseleave={onCellLeave}
              role="gridcell"
              tabindex="0"
            >
              {#if showValues && cellLargeEnough}
                <span class="cy-heatmap__cell-val" style="color: {textColor(val)}">{formatVal(val)}</span>
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
    <div class="cy-heatmap__tooltip" style="left: {tooltipPos.x}px; top: {tooltipPos.y}px;">
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

<style>
  .cy-heatmap {
    position: relative;
    font-family: var(--font-body);
    display: flex;
    flex-direction: column;
  }

  .cy-heatmap__title {
    font-family: var(--font-display);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    text-align: center;
    margin-bottom: var(--space-3);
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
