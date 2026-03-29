<svelte:options runes={true} />

<script lang="ts">
  type BurndownEntry = { date: string; remaining: number; ideal?: number };

  let {
    data = [],
    totalPoints = 0,
    sprintStart = "",
    sprintEnd = "",
    width = "100%",
    height = "350px",
    showIdealLine = true,
    showGrid = true,
    showTooltip = true,
    unit = "points",
  }: {
    data?: BurndownEntry[];
    totalPoints?: number;
    sprintStart?: string;
    sprintEnd?: string;
    width?: string;
    height?: string;
    showIdealLine?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    unit?: string;
  } = $props();

  const viewW = 600;
  const viewH = 300;
  const padding = { top: 20, right: 20, bottom: 50, left: 50 };
  const plotW = viewW - padding.left - padding.right;
  const plotH = viewH - padding.top - padding.bottom;

  let hoverIndex: number | null = $state(null);
  let mousePos = $state({ x: 0, y: 0 });

  // Compute ideal line values if not provided in data
  let enrichedData = $derived.by(() => {
    if (data.length === 0) return [];
    const total = totalPoints || (data.length > 0 ? data[0].remaining : 0);
    const count = data.length;
    return data.map((d, i) => ({
      ...d,
      ideal: d.ideal ?? (total - (total / (count - 1)) * i),
    }));
  });

  let maxY = $derived(
    enrichedData.length
      ? Math.max(...enrichedData.map((d) => Math.max(d.remaining, d.ideal ?? 0)), 1)
      : 1
  );

  function scaleX(i: number): number {
    const count = enrichedData.length;
    if (count <= 1) return padding.left + plotW / 2;
    return padding.left + (i / (count - 1)) * plotW;
  }

  function scaleY(val: number): number {
    return padding.top + plotH - (val / maxY) * plotH;
  }

  function linePath(points: { x: number; y: number }[]): string {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  }

  let actualPath = $derived(
    linePath(enrichedData.map((_, i) => ({ x: scaleX(i), y: scaleY(enrichedData[i].remaining) })))
  );

  let idealPath = $derived(
    linePath(enrichedData.map((_, i) => ({ x: scaleX(i), y: scaleY(enrichedData[i].ideal ?? 0) })))
  );

  let areaPath = $derived.by(() => {
    if (enrichedData.length === 0) return "";
    const top = enrichedData.map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(d.remaining)}`).join(" ");
    const lastIdx = enrichedData.length - 1;
    return `${top} L${scaleX(lastIdx)},${scaleY(0)} L${scaleX(0)},${scaleY(0)} Z`;
  });

  // Today marker index
  let todayIndex = $derived.by(() => {
    if (!sprintStart || !sprintEnd) return -1;
    const today = new Date().toISOString().split("T")[0];
    if (today < sprintStart || today > sprintEnd) return -1;
    return enrichedData.findIndex((d) => d.date >= today);
  });

  function formatDate(d: string): string {
    const parts = d.split("-");
    if (parts.length >= 3) return `${parts[1]}/${parts[2]}`;
    return d;
  }

  function niceSteps(max: number, count: number): number[] {
    const step = max / count;
    return Array.from({ length: count + 1 }, (_, i) => Math.round(step * i));
  }

  let yTicks = $derived(niceSteps(maxY, 4));

  function onMouseMove(e: MouseEvent) {
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * viewW;
    const dataIdx = Math.round(((svgX - padding.left) / plotW) * (enrichedData.length - 1));
    if (dataIdx >= 0 && dataIdx < enrichedData.length) {
      hoverIndex = dataIdx;
      mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    } else {
      hoverIndex = null;
    }
  }

  function onMouseLeave() {
    hoverIndex = null;
  }
</script>

<div class="cy-burndown" style="width: {width}; height: {height};">
  <svg
    viewBox="0 0 {viewW} {viewH}"
    preserveAspectRatio="xMidYMid meet"
    class="cy-burndown__svg"
    onmousemove={onMouseMove}
    onmouseleave={onMouseLeave}
    role="img"
    aria-label="Burndown chart"
  >
    <defs>
      <linearGradient id="burndown-area-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--color-action-brand-default)" stop-opacity="0.3" />
        <stop offset="100%" stop-color="var(--color-action-brand-default)" stop-opacity="0.02" />
      </linearGradient>
    </defs>

    {#if showGrid}
      {#each yTicks as tick}
        <line
          x1={padding.left} y1={scaleY(tick)}
          x2={viewW - padding.right} y2={scaleY(tick)}
          class="cy-burndown__grid"
        />
      {/each}
      {#each enrichedData as _, i}
        <line
          x1={scaleX(i)} y1={padding.top}
          x2={scaleX(i)} y2={padding.top + plotH}
          class="cy-burndown__grid"
        />
      {/each}
    {/if}

    <!-- Axes -->
    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} class="cy-burndown__axis" />
    <line x1={padding.left} y1={padding.top + plotH} x2={viewW - padding.right} y2={padding.top + plotH} class="cy-burndown__axis" />

    <!-- Y tick labels -->
    {#each yTicks as tick}
      <text x={padding.left - 8} y={scaleY(tick) + 4} class="cy-burndown__tick" text-anchor="end">{tick}</text>
    {/each}

    <!-- X tick labels -->
    {#each enrichedData as entry, i}
      <text x={scaleX(i)} y={padding.top + plotH + 16} class="cy-burndown__tick" text-anchor="middle">{formatDate(entry.date)}</text>
    {/each}

    <!-- Unit label -->
    <text x={padding.left - 8} y={padding.top - 6} class="cy-burndown__unit" text-anchor="end">{unit}</text>

    <!-- Area fill under actual line -->
    {#if enrichedData.length > 0}
      <path d={areaPath} fill="url(#burndown-area-grad)" class="cy-burndown__area" />
    {/if}

    <!-- Ideal line -->
    {#if showIdealLine && enrichedData.length > 0}
      <path d={idealPath} fill="none" class="cy-burndown__ideal-line" />
    {/if}

    <!-- Actual line -->
    {#if enrichedData.length > 0}
      <path d={actualPath} fill="none" class="cy-burndown__actual-line" />
      {#each enrichedData as entry, i}
        <circle
          cx={scaleX(i)}
          cy={scaleY(entry.remaining)}
          r="3"
          class="cy-burndown__dot"
        />
      {/each}
    {/if}

    <!-- Today marker -->
    {#if todayIndex >= 0}
      <line
        x1={scaleX(todayIndex)} y1={padding.top}
        x2={scaleX(todayIndex)} y2={padding.top + plotH}
        class="cy-burndown__today"
      />
      <text
        x={scaleX(todayIndex)} y={padding.top + plotH + 30}
        class="cy-burndown__today-label"
        text-anchor="middle"
      >Today</text>
    {/if}

    <!-- Hover crosshair -->
    {#if showTooltip && hoverIndex !== null}
      <line
        x1={scaleX(hoverIndex)} y1={padding.top}
        x2={scaleX(hoverIndex)} y2={padding.top + plotH}
        class="cy-burndown__crosshair"
      />
      <circle
        cx={scaleX(hoverIndex)}
        cy={scaleY(enrichedData[hoverIndex].remaining)}
        r="5"
        class="cy-burndown__hover-dot"
      />
    {/if}
  </svg>

  {#if showTooltip && hoverIndex !== null && enrichedData[hoverIndex]}
    {@const entry = enrichedData[hoverIndex]}
    <div class="cy-burndown__tooltip" style="left: {mousePos.x + 12}px; top: {mousePos.y - 8}px;">
      <div class="cy-burndown__tooltip-date">{entry.date}</div>
      <div class="cy-burndown__tooltip-row">Remaining: {entry.remaining} {unit}</div>
      {#if showIdealLine}
        <div class="cy-burndown__tooltip-row">Ideal: {Math.round(entry.ideal ?? 0)} {unit}</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .cy-burndown {
    position: relative;
    font-family: var(--font-body);
  }

  .cy-burndown__svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .cy-burndown__grid {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-burndown__axis {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-burndown__tick {
    font-size: 9px;
    fill: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }

  .cy-burndown__unit {
    font-size: 9px;
    fill: var(--color-text-secondary);
    font-family: var(--font-mono);
  }

  .cy-burndown__area {
    opacity: 0.8;
  }

  .cy-burndown__ideal-line {
    stroke: var(--color-text-tertiary);
    stroke-width: 2;
    stroke-dasharray: 8 4;
  }

  .cy-burndown__actual-line {
    stroke: var(--color-action-brand-default);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .cy-burndown__dot {
    fill: var(--color-action-brand-default);
  }

  .cy-burndown__hover-dot {
    fill: var(--color-action-brand-default);
    filter: drop-shadow(0 0 4px var(--color-action-brand-default));
  }

  .cy-burndown__today {
    stroke: var(--color-action-secondary-default);
    stroke-width: 1.5;
    stroke-dasharray: 4 3;
  }

  .cy-burndown__today-label {
    font-size: 9px;
    fill: var(--color-action-secondary-default);
    font-family: var(--font-mono);
  }

  .cy-burndown__crosshair {
    stroke: var(--color-text-tertiary);
    stroke-width: 1;
    stroke-dasharray: 4 2;
  }

  .cy-burndown__tooltip {
    position: absolute;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    font-size: 0.75rem;
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
  }

  .cy-burndown__tooltip-date {
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 4px;
    font-family: var(--font-mono);
  }

  .cy-burndown__tooltip-row {
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 0.7rem;
  }
</style>
