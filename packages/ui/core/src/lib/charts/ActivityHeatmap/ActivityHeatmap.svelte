<svelte:options runes={true} />

<script lang="ts">
  type DataPoint = { date: string; value: number };

  let {
    data = [],
    startDate = "",
    endDate = "",
    colorScale = "green",
    showMonthLabels = true,
    showDayLabels = true,
    showTooltip = true,
    cellSize = 12,
    cellGap = 2,
    maxValue = 0,
    label = "",
  }: {
    data?: DataPoint[];
    startDate?: string;
    endDate?: string;
    colorScale?: "green" | "cyan" | "violet";
    showMonthLabels?: boolean;
    showDayLabels?: boolean;
    showTooltip?: boolean;
    cellSize?: number;
    cellGap?: number;
    maxValue?: number;
    label?: string;
  } = $props();

  let hoveredCell: { date: string; value: number; x: number; y: number } | null = $state(null);
  let containerEl: HTMLDivElement | undefined = $state(undefined);

  const DAY_LABEL_WIDTH = 32;
  const MONTH_LABEL_HEIGHT = 18;
  const LEGEND_HEIGHT = 28;
  const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

  // Color scale mappings using CSS variables
  const colorScales = {
    green: [
      "var(--color-surface-hover)",
      "var(--color-action-brand-active)",
      "var(--color-action-brand-hover)",
      "var(--color-action-brand-default)",
      "var(--color-state-success)",
    ],
    cyan: [
      "var(--color-surface-hover)",
      "var(--color-action-secondary-active)",
      "var(--color-action-secondary-hover)",
      "var(--color-action-secondary-default)",
      "var(--color-state-info)",
    ],
    violet: [
      "var(--color-surface-hover)",
      "var(--color-action-tertiary-active)",
      "var(--color-action-tertiary-hover)",
      "var(--color-action-tertiary-default)",
      "var(--color-border-focus)",
    ],
  };

  let colors = $derived(colorScales[colorScale]);

  let dateStart = $derived.by(() => {
    if (startDate) return new Date(startDate);
    const d = new Date();
    d.setDate(d.getDate() - 52 * 7);
    // Align to Sunday (start of week)
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  let dateEnd = $derived.by(() => {
    if (endDate) return new Date(endDate);
    return new Date();
  });

  // Build lookup map
  let dataMap = $derived.by(() => {
    const map = new Map<string, number>();
    for (const d of data) {
      map.set(d.date, d.value);
    }
    return map;
  });

  let effectiveMax = $derived.by(() => {
    if (maxValue > 0) return maxValue;
    if (!data.length) return 1;
    return Math.max(1, ...data.map((d) => d.value));
  });

  function getLevel(value: number): number {
    if (value <= 0) return 0;
    const ratio = value / effectiveMax;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  }

  function formatDateStr(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Build grid: array of weeks, each week is array of 7 day cells
  type Cell = { date: string; value: number; col: number; row: number };

  let grid = $derived.by((): Cell[] => {
    const cells: Cell[] = [];
    const cursor = new Date(dateStart);
    let col = 0;

    while (cursor <= dateEnd) {
      const row = cursor.getDay(); // 0=Sun, 6=Sat
      const dateStr = toISODate(cursor);
      const value = dataMap.get(dateStr) || 0;
      // Remap: Mon=0..Sun=6 for display (Mon at top)
      const displayRow = row === 0 ? 6 : row - 1;
      cells.push({ date: dateStr, value, col, row: displayRow });

      // Advance day, new week on Sunday
      cursor.setDate(cursor.getDate() + 1);
      if (cursor.getDay() === 0) col++;
    }
    return cells;
  });

  let numWeeks = $derived.by(() => {
    if (!grid.length) return 0;
    return Math.max(...grid.map((c) => c.col)) + 1;
  });

  // Month labels
  type MonthLabel = { label: string; col: number };

  let monthLabels = $derived.by((): MonthLabel[] => {
    const labels: MonthLabel[] = [];
    let lastMonth = -1;
    const cursor = new Date(dateStart);
    let col = 0;

    while (cursor <= dateEnd) {
      const month = cursor.getMonth();
      if (month !== lastMonth && cursor.getDay() === 0) {
        labels.push({
          label: cursor.toLocaleDateString("en-US", { month: "short" }),
          col,
        });
        lastMonth = month;
      }
      cursor.setDate(cursor.getDate() + 1);
      if (cursor.getDay() === 0) col++;
    }
    return labels;
  });

  let svgWidth = $derived(DAY_LABEL_WIDTH + numWeeks * (cellSize + cellGap));
  let svgHeight = $derived(MONTH_LABEL_HEIGHT + 7 * (cellSize + cellGap) + LEGEND_HEIGHT);

  function onCellMouseEnter(e: MouseEvent, cell: Cell) {
    if (!showTooltip) return;
    if (containerEl) {
      const bounds = containerEl.getBoundingClientRect();
      hoveredCell = {
        date: cell.date,
        value: cell.value,
        x: e.clientX - bounds.left + 12,
        y: e.clientY - bounds.top - 8,
      };
    }
  }

  function onCellMouseLeave() {
    hoveredCell = null;
  }
</script>

<div class="cy-heatmap" bind:this={containerEl}>
  {#if label}
    <div class="cy-heatmap__label">{label}</div>
  {/if}
  <svg width={svgWidth} height={svgHeight} class="cy-heatmap__svg">
    <!-- Month labels -->
    {#if showMonthLabels}
      {#each monthLabels as ml}
        <text
          x={DAY_LABEL_WIDTH + ml.col * (cellSize + cellGap)}
          y={MONTH_LABEL_HEIGHT - 4}
          class="cy-heatmap__month-label"
        >{ml.label}</text>
      {/each}
    {/if}

    <!-- Day labels -->
    {#if showDayLabels}
      {#each DAY_LABELS as dayLabel, i}
        {#if dayLabel}
          <text
            x={DAY_LABEL_WIDTH - 6}
            y={MONTH_LABEL_HEIGHT + i * (cellSize + cellGap) + cellSize / 2 + 1}
            class="cy-heatmap__day-label"
            text-anchor="end"
            dominant-baseline="central"
          >{dayLabel}</text>
        {/if}
      {/each}
    {/if}

    <!-- Cells -->
    {#each grid as cell}
      <rect
        x={DAY_LABEL_WIDTH + cell.col * (cellSize + cellGap)}
        y={MONTH_LABEL_HEIGHT + cell.row * (cellSize + cellGap)}
        width={cellSize}
        height={cellSize}
        rx="2"
        ry="2"
        fill={colors[getLevel(cell.value)]}
        class="cy-heatmap__cell"
        onmouseenter={(e) => onCellMouseEnter(e, cell)}
        onmouseleave={onCellMouseLeave}
      />
    {/each}

    <!-- Legend -->
    <text
      x={svgWidth - 5 * (cellSize + cellGap) - 40}
      y={MONTH_LABEL_HEIGHT + 7 * (cellSize + cellGap) + 18}
      class="cy-heatmap__legend-text"
      text-anchor="end"
    >Less</text>
    {#each [0, 1, 2, 3, 4] as level, i}
      <rect
        x={svgWidth - (5 - i) * (cellSize + cellGap) - 28}
        y={MONTH_LABEL_HEIGHT + 7 * (cellSize + cellGap) + 8}
        width={cellSize}
        height={cellSize}
        rx="2"
        ry="2"
        fill={colors[level]}
        class="cy-heatmap__cell"
      />
    {/each}
    <text
      x={svgWidth - 20}
      y={MONTH_LABEL_HEIGHT + 7 * (cellSize + cellGap) + 18}
      class="cy-heatmap__legend-text"
    >More</text>
  </svg>

  <!-- Tooltip -->
  {#if hoveredCell}
    <div class="cy-heatmap__tooltip" style="left: {hoveredCell.x}px; top: {hoveredCell.y}px;">
      <span class="cy-heatmap__tooltip-date">{formatDateStr(hoveredCell.date)}</span>
      <span class="cy-heatmap__tooltip-value">{hoveredCell.value} contributions</span>
    </div>
  {/if}
</div>

<style>
  .cy-heatmap {
    position: relative;
    display: inline-block;
    font-family: var(--font-body);
  }

  .cy-heatmap__label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    margin-bottom: 8px;
  }

  .cy-heatmap__svg {
    display: block;
  }

  .cy-heatmap__month-label {
    font-size: 9px;
    fill: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }

  .cy-heatmap__day-label {
    font-size: 9px;
    fill: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }

  .cy-heatmap__cell {
    transition: opacity 100ms ease;
    stroke: var(--color-surface-default);
    stroke-width: 1;
  }

  .cy-heatmap__cell:hover {
    opacity: 0.8;
    stroke: var(--color-border-default);
    stroke-width: 1.5;
  }

  .cy-heatmap__legend-text {
    font-size: 9px;
    fill: var(--color-text-tertiary);
    font-family: var(--font-mono);
    dominant-baseline: central;
  }

  .cy-heatmap__tooltip {
    position: absolute;
    background: var(--color-surface-overlay);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    font-size: 0.7rem;
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cy-heatmap__tooltip-date {
    color: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-heatmap__tooltip-value {
    color: var(--color-text-primary);
    font-family: var(--font-mono);
    font-weight: 600;
  }
</style>
