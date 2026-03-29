<svelte:options runes={true} />

<script lang="ts">
  type CfdEntry = { date: string; [status: string]: number | string };
  type StatusDef = { key: string; label: string; color?: string };

  let {
    data = [],
    statuses = [],
    width = "100%",
    height = "350px",
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    xLabel = "",
    yLabel = "",
  }: {
    data?: CfdEntry[];
    statuses?: StatusDef[];
    width?: string;
    height?: string;
    showGrid?: boolean;
    showLegend?: boolean;
    showTooltip?: boolean;
    xLabel?: string;
    yLabel?: string;
  } = $props();

  const defaultColors = [
    "var(--color-action-brand-default)",
    "var(--color-action-secondary-default)",
    "var(--color-state-warning)",
    "var(--color-action-tertiary-default)",
    "var(--color-state-error)",
  ];

  const viewW = 600;
  const viewH = 300;
  const padding = { top: 20, right: 20, bottom: 50, left: 50 };
  const plotW = viewW - padding.left - padding.right;
  const plotH = viewH - padding.top - padding.bottom;

  let hoverIndex: number | null = $state(null);
  let mousePos = $state({ x: 0, y: 0 });

  function getColor(statusDef: StatusDef, i: number): string {
    return statusDef.color || defaultColors[i % defaultColors.length];
  }

  // Compute cumulative stacked values for each date
  let stackedData = $derived.by(() => {
    if (data.length === 0 || statuses.length === 0) return [];

    return data.map((entry) => {
      let cumulative = 0;
      const values: { key: string; y0: number; y1: number }[] = [];
      for (const s of statuses) {
        const val = typeof entry[s.key] === "number" ? (entry[s.key] as number) : 0;
        values.push({ key: s.key, y0: cumulative, y1: cumulative + val });
        cumulative += val;
      }
      return { date: entry.date, values, total: cumulative };
    });
  });

  let maxY = $derived(
    stackedData.length ? Math.max(...stackedData.map((d) => d.total), 1) : 1
  );

  function scaleX(i: number): number {
    const count = data.length;
    if (count <= 1) return padding.left + plotW / 2;
    return padding.left + (i / (count - 1)) * plotW;
  }

  function scaleY(val: number): number {
    return padding.top + plotH - (val / maxY) * plotH;
  }

  // Build area path for a status layer
  function areaPath(statusIndex: number): string {
    if (stackedData.length === 0) return "";
    const top = stackedData.map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(d.values[statusIndex].y1)}`).join(" ");
    const bottom = [...stackedData].reverse().map((d, ri) => {
      const i = stackedData.length - 1 - ri;
      return `L${scaleX(i)},${scaleY(d.values[statusIndex].y0)}`;
    }).join(" ");
    return `${top} ${bottom} Z`;
  }

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
    const dataIdx = Math.round(((svgX - padding.left) / plotW) * (data.length - 1));
    if (dataIdx >= 0 && dataIdx < data.length) {
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

<div class="cy-cfd" style="width: {width}; height: {height};">
  <svg
    viewBox="0 0 {viewW} {viewH}"
    preserveAspectRatio="xMidYMid meet"
    class="cy-cfd__svg"
    onmousemove={onMouseMove}
    onmouseleave={onMouseLeave}
    role="img"
    aria-label="Cumulative Flow Diagram"
  >
    {#if showGrid}
      {#each yTicks as tick}
        <line
          x1={padding.left} y1={scaleY(tick)}
          x2={viewW - padding.right} y2={scaleY(tick)}
          class="cy-cfd__grid"
        />
      {/each}
      {#each data as _, i}
        <line
          x1={scaleX(i)} y1={padding.top}
          x2={scaleX(i)} y2={padding.top + plotH}
          class="cy-cfd__grid"
        />
      {/each}
    {/if}

    <!-- Axes -->
    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} class="cy-cfd__axis" />
    <line x1={padding.left} y1={padding.top + plotH} x2={viewW - padding.right} y2={padding.top + plotH} class="cy-cfd__axis" />

    <!-- Y tick labels -->
    {#each yTicks as tick}
      <text x={padding.left - 8} y={scaleY(tick) + 4} class="cy-cfd__tick" text-anchor="end">{tick}</text>
    {/each}

    <!-- X tick labels -->
    {#each data as entry, i}
      <text x={scaleX(i)} y={padding.top + plotH + 16} class="cy-cfd__tick" text-anchor="middle">{formatDate(entry.date)}</text>
    {/each}

    <!-- Axis labels -->
    {#if xLabel}
      <text x={padding.left + plotW / 2} y={viewH - 4} class="cy-cfd__axis-label" text-anchor="middle">{xLabel}</text>
    {/if}
    {#if yLabel}
      <text
        x={12} y={padding.top + plotH / 2}
        class="cy-cfd__axis-label"
        text-anchor="middle"
        transform="rotate(-90, 12, {padding.top + plotH / 2})"
      >{yLabel}</text>
    {/if}

    <!-- Stacked areas (render top-to-bottom so bottom layers paint last on top visually — actually reverse so bottom is behind) -->
    {#each statuses as status, i}
      <path
        d={areaPath(i)}
        fill={getColor(status, i)}
        opacity="0.75"
        class="cy-cfd__area"
      />
    {/each}

    <!-- Hover crosshair -->
    {#if showTooltip && hoverIndex !== null}
      <line
        x1={scaleX(hoverIndex)} y1={padding.top}
        x2={scaleX(hoverIndex)} y2={padding.top + plotH}
        class="cy-cfd__crosshair"
      />
    {/if}
  </svg>

  {#if showTooltip && hoverIndex !== null && stackedData[hoverIndex]}
    <div class="cy-cfd__tooltip" style="left: {mousePos.x + 12}px; top: {mousePos.y - 8}px;">
      <div class="cy-cfd__tooltip-date">{data[hoverIndex].date}</div>
      {#each [...statuses].reverse() as status, ri}
        {@const i = statuses.length - 1 - ri}
        {@const val = stackedData[hoverIndex].values[i].y1 - stackedData[hoverIndex].values[i].y0}
        <div class="cy-cfd__tooltip-row">
          <span class="cy-cfd__tooltip-dot" style="background: {getColor(status, i)}"></span>
          <span class="cy-cfd__tooltip-name">{status.label}:</span>
          <span class="cy-cfd__tooltip-val">{val}</span>
        </div>
      {/each}
    </div>
  {/if}

  {#if showLegend && statuses.length > 0}
    <div class="cy-cfd__legend">
      {#each statuses as status, i}
        <div class="cy-cfd__legend-item">
          <span class="cy-cfd__legend-dot" style="background: {getColor(status, i)}"></span>
          <span>{status.label}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cy-cfd {
    position: relative;
    font-family: var(--font-body);
  }

  .cy-cfd__svg {
    width: 100%;
    height: calc(100% - 28px);
    display: block;
  }

  .cy-cfd__grid {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-cfd__axis {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-cfd__tick {
    font-size: 9px;
    fill: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }

  .cy-cfd__axis-label {
    font-size: 10px;
    fill: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-cfd__area {
    transition: opacity 150ms ease;
  }

  .cy-cfd__crosshair {
    stroke: var(--color-text-tertiary);
    stroke-width: 1;
    stroke-dasharray: 4 2;
  }

  .cy-cfd__tooltip {
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

  .cy-cfd__tooltip-date {
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 4px;
    font-family: var(--font-mono);
  }

  .cy-cfd__tooltip-row {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-text-primary);
  }

  .cy-cfd__tooltip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .cy-cfd__tooltip-name {
    color: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-cfd__tooltip-val {
    font-family: var(--font-mono);
    color: var(--color-text-primary);
  }

  .cy-cfd__legend {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    padding-top: var(--space-2);
  }

  .cy-cfd__legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .cy-cfd__legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
</style>
