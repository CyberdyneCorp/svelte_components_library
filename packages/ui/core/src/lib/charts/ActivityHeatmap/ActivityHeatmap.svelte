<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";

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
  let canvas: HTMLCanvasElement | undefined = $state(undefined);

  const DAY_LABEL_WIDTH = 32;
  const MONTH_LABEL_HEIGHT = 18;
  const LEGEND_HEIGHT = 28;
  const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

  // Hardcoded color levels (resolved at render time from CSS vars)
  const COLOR_KEYS: Record<string, string[]> = {
    green: ["--color-surface-hover", "--color-action-brand-active", "--color-action-brand-hover", "--color-action-brand-default", "--color-state-success"],
    cyan: ["--color-surface-hover", "--color-action-secondary-active", "--color-action-secondary-hover", "--color-action-secondary-default", "--color-state-info"],
    violet: ["--color-surface-hover", "--color-action-tertiary-active", "--color-action-tertiary-hover", "--color-action-tertiary-default", "--color-border-focus"],
  };

  // Build data map
  let dataMap = $derived.by(() => {
    const map = new Map<string, number>();
    for (const d of data) map.set(d.date, d.value);
    return map;
  });

  let effectiveMax = $derived.by(() => {
    if (maxValue > 0) return maxValue;
    if (!data.length) return 1;
    let m = 0;
    for (const d of data) { if (d.value > m) m = d.value; }
    return Math.max(1, m);
  });

  let dateStart = $derived.by(() => {
    if (startDate) return new Date(startDate);
    const d = new Date();
    d.setDate(d.getDate() - 52 * 7);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  let dateEnd = $derived.by(() => {
    if (endDate) return new Date(endDate);
    return new Date();
  });

  function toISODate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function getLevel(value: number): number {
    if (value <= 0) return 0;
    const ratio = value / effectiveMax;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  }

  // Build grid in a single pass
  type Cell = { date: string; value: number; col: number; row: number };
  type MonthLabel = { label: string; col: number };

  let gridData = $derived.by(() => {
    const cells: Cell[] = [];
    const months: MonthLabel[] = [];
    const cursor = new Date(dateStart);
    let col = 0;
    let lastMonth = -1;

    while (cursor <= dateEnd) {
      const dow = cursor.getDay();
      const dateStr = toISODate(cursor);
      const value = dataMap.get(dateStr) || 0;
      const displayRow = dow === 0 ? 6 : dow - 1;
      cells.push({ date: dateStr, value, col, row: displayRow });

      const month = cursor.getMonth();
      if (month !== lastMonth && dow === 0) {
        months.push({ label: cursor.toLocaleDateString("en-US", { month: "short" }), col });
        lastMonth = month;
      }
      cursor.setDate(cursor.getDate() + 1);
      if (cursor.getDay() === 0) col++;
    }
    return { cells, months, weeks: col + 1 };
  });

  let canvasWidth = $derived(DAY_LABEL_WIDTH + gridData.weeks * (cellSize + cellGap) + 10);
  let canvasHeight = $derived(MONTH_LABEL_HEIGHT + 7 * (cellSize + cellGap) + LEGEND_HEIGHT);

  // Resolve CSS colors once
  let resolvedColors: string[] = [];
  function resolveColors() {
    const s = getComputedStyle(document.documentElement);
    const keys = COLOR_KEYS[colorScale] || COLOR_KEYS.green;
    resolvedColors = keys.map(k => s.getPropertyValue(k).trim() || "#333");
  }

  function render() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const textColor = getComputedStyle(document.documentElement).getPropertyValue("--color-text-tertiary").trim() || "#666";
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue("--color-surface-default").trim() || "#111";

    // Month labels
    if (showMonthLabels) {
      ctx.font = "9px monospace";
      ctx.fillStyle = textColor;
      ctx.textBaseline = "bottom";
      for (const ml of gridData.months) {
        ctx.fillText(ml.label, DAY_LABEL_WIDTH + ml.col * (cellSize + cellGap), MONTH_LABEL_HEIGHT - 2);
      }
    }

    // Day labels
    if (showDayLabels) {
      ctx.font = "9px monospace";
      ctx.fillStyle = textColor;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let i = 0; i < DAY_LABELS.length; i++) {
        if (DAY_LABELS[i]) {
          ctx.fillText(DAY_LABELS[i], DAY_LABEL_WIDTH - 6, MONTH_LABEL_HEIGHT + i * (cellSize + cellGap) + cellSize / 2);
        }
      }
    }

    // Cells — the fast path
    ctx.textAlign = "left";
    for (const cell of gridData.cells) {
      const x = DAY_LABEL_WIDTH + cell.col * (cellSize + cellGap);
      const y = MONTH_LABEL_HEIGHT + cell.row * (cellSize + cellGap);
      const level = getLevel(cell.value);

      ctx.fillStyle = resolvedColors[level] || resolvedColors[0];
      ctx.beginPath();
      ctx.roundRect(x, y, cellSize, cellSize, 2);
      ctx.fill();
    }

    // Legend
    const legendY = MONTH_LABEL_HEIGHT + 7 * (cellSize + cellGap) + 8;
    const legendX = canvasWidth - 5 * (cellSize + cellGap) - 30;
    ctx.font = "9px monospace";
    ctx.fillStyle = textColor;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("Less", legendX - 4, legendY + cellSize / 2);
    ctx.textAlign = "left";
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = resolvedColors[i];
      ctx.beginPath();
      ctx.roundRect(legendX + i * (cellSize + cellGap), legendY, cellSize, cellSize, 2);
      ctx.fill();
    }
    ctx.fillStyle = textColor;
    ctx.fillText("More", legendX + 5 * (cellSize + cellGap) + 4, legendY + cellSize / 2);
  }

  function formatDateStr(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function handleMouseMove(e: MouseEvent) {
    if (!showTooltip || !canvas || !containerEl) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Find which cell the mouse is over
    for (const cell of gridData.cells) {
      const cx = DAY_LABEL_WIDTH + cell.col * (cellSize + cellGap);
      const cy = MONTH_LABEL_HEIGHT + cell.row * (cellSize + cellGap);
      if (mx >= cx && mx <= cx + cellSize && my >= cy && my <= cy + cellSize) {
        const bounds = containerEl.getBoundingClientRect();
        hoveredCell = { date: cell.date, value: cell.value, x: e.clientX - bounds.left + 12, y: e.clientY - bounds.top - 8 };
        return;
      }
    }
    hoveredCell = null;
  }

  function handleMouseLeave() {
    hoveredCell = null;
  }

  onMount(() => {
    resolveColors();
    render();
  });

  // Re-render when data changes
  $effect(() => {
    void gridData;
    void colorScale;
    if (canvas) {
      resolveColors();
      render();
    }
  });
</script>

<div class="cy-heatmap" bind:this={containerEl}>
  {#if label}
    <div class="cy-heatmap__label">{label}</div>
  {/if}
  <canvas
    bind:this={canvas}
    class="cy-heatmap__canvas"
    onmousemove={handleMouseMove}
    onmouseleave={handleMouseLeave}
  ></canvas>

  {#if hoveredCell}
    <div class="cy-heatmap__tooltip" style="left: {hoveredCell.x}px; top: {hoveredCell.y}px;">
      <span class="cy-heatmap__tooltip-date">{formatDateStr(hoveredCell.date)}</span>
      <span class="cy-heatmap__tooltip-value">{hoveredCell.value} {label || "contributions"}</span>
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

  .cy-heatmap__canvas {
    display: block;
    cursor: default;
  }

  .cy-heatmap__tooltip {
    position: absolute;
    background: var(--color-surface-overlay);
    border: 1px solid var(--color-border-subtle);
    border-radius: 4px;
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
