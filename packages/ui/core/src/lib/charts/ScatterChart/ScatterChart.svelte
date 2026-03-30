<svelte:options runes={true} />

<script lang="ts">
  type DataPoint = { x: number; y: number; label?: string; color?: string; size?: number };
  type Series = { name: string; data: DataPoint[]; color?: string };

  let {
    series = [],
    width = "100%",
    height = "300px",
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    xLabel = "",
    yLabel = "",
    animate = true,
    pointSize = 5,
    showTrendLine = false,
    onPointClick,
    class: className = "",
  }: {
    series?: Series[];
    width?: string;
    height?: string;
    showGrid?: boolean;
    showLegend?: boolean;
    showTooltip?: boolean;
    xLabel?: string;
    yLabel?: string;
    animate?: boolean;
    pointSize?: number;
    showTrendLine?: boolean;
    onPointClick?: (point: DataPoint, seriesName: string) => void;
    class?: string;
  } = $props();

  const defaultColors = ["#00ff41", "#00d4ff", "#a855f7", "#ffb800", "#ff5555", "#50fa7b"];
  const viewW = 600;
  const viewH = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const plotW = viewW - padding.left - padding.right;
  const plotH = viewH - padding.top - padding.bottom;

  function getColor(s: Series, i: number): string {
    return s.color || defaultColors[i % defaultColors.length];
  }

  let allPoints = $derived(series.flatMap((s) => s.data));

  let xMin = $derived(allPoints.length > 0 ? Math.min(...allPoints.map((p) => p.x)) : 0);
  let xMax = $derived(allPoints.length > 0 ? Math.max(...allPoints.map((p) => p.x)) : 1);
  let yMin = $derived(allPoints.length > 0 ? Math.min(...allPoints.map((p) => p.y)) : 0);
  let yMax = $derived(allPoints.length > 0 ? Math.max(...allPoints.map((p) => p.y)) : 1);

  let xRange = $derived(xMax - xMin || 1);
  let yRange = $derived(yMax - yMin || 1);

  // Add 5% padding to ranges
  let xPadded = $derived({ min: xMin - xRange * 0.05, max: xMax + xRange * 0.05 });
  let yPadded = $derived({ min: yMin - yRange * 0.05, max: yMax + yRange * 0.05 });
  let xRangeP = $derived(xPadded.max - xPadded.min || 1);
  let yRangeP = $derived(yPadded.max - yPadded.min || 1);

  function scaleX(v: number): number {
    return padding.left + ((v - xPadded.min) / xRangeP) * plotW;
  }

  function scaleY(v: number): number {
    return padding.top + plotH - ((v - yPadded.min) / yRangeP) * plotH;
  }

  function formatNum(n: number): string {
    return Math.abs(n) >= 1000 ? n.toFixed(0) : n.toPrecision(3);
  }

  // Grid ticks
  let xTicks = $derived.by(() => {
    const count = 6;
    const step = xRangeP / count;
    return Array.from({ length: count + 1 }, (_, i) => xPadded.min + i * step);
  });

  let yTicks = $derived.by(() => {
    const count = 5;
    const step = yRangeP / count;
    return Array.from({ length: count + 1 }, (_, i) => yPadded.min + i * step);
  });

  // Trend line (linear regression)
  function computeTrendLine(data: DataPoint[]): { x1: number; y1: number; x2: number; y2: number } | null {
    if (data.length < 2) return null;
    const n = data.length;
    const sumX = data.reduce((a, p) => a + p.x, 0);
    const sumY = data.reduce((a, p) => a + p.y, 0);
    const sumXY = data.reduce((a, p) => a + p.x * p.y, 0);
    const sumX2 = data.reduce((a, p) => a + p.x * p.x, 0);
    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return null;
    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    return {
      x1: xPadded.min,
      y1: slope * xPadded.min + intercept,
      x2: xPadded.max,
      y2: slope * xPadded.max + intercept,
    };
  }

  // Tooltip state
  let hoveredPoint: { point: DataPoint; seriesIdx: number; x: number; y: number } | null = $state(null);

  function handlePointEnter(point: DataPoint, seriesIdx: number, e: MouseEvent) {
    const svg = (e.currentTarget as SVGElement).closest("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    hoveredPoint = {
      point,
      seriesIdx,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function handlePointLeave() {
    hoveredPoint = null;
  }

  function handlePointClick(point: DataPoint, seriesName: string) {
    onPointClick?.(point, seriesName);
  }
</script>

<div class="cy-scatter-chart {className}" style="width: {width}; height: {height};">
  {#if showLegend && series.length > 1}
    <div class="cy-scatter-chart__legend">
      {#each series as s, i}
        <div class="cy-scatter-chart__legend-item">
          <span class="cy-scatter-chart__legend-dot" style="background: {getColor(s, i)}"></span>
          <span class="cy-scatter-chart__legend-name">{s.name}</span>
        </div>
      {/each}
    </div>
  {/if}

  <svg
    viewBox="0 0 {viewW} {viewH}"
    preserveAspectRatio="xMidYMid meet"
    class="cy-scatter-chart__svg"
    role="img"
    aria-label="Scatter chart"
  >
    <!-- Grid -->
    {#if showGrid}
      {#each xTicks as tick}
        <line
          x1={scaleX(tick)} y1={padding.top}
          x2={scaleX(tick)} y2={padding.top + plotH}
          class="cy-scatter-chart__grid"
        />
      {/each}
      {#each yTicks as tick}
        <line
          x1={padding.left} y1={scaleY(tick)}
          x2={padding.left + plotW} y2={scaleY(tick)}
          class="cy-scatter-chart__grid"
        />
      {/each}
    {/if}

    <!-- Axes -->
    <line
      x1={padding.left} y1={padding.top + plotH}
      x2={padding.left + plotW} y2={padding.top + plotH}
      class="cy-scatter-chart__axis"
    />
    <line
      x1={padding.left} y1={padding.top}
      x2={padding.left} y2={padding.top + plotH}
      class="cy-scatter-chart__axis"
    />

    <!-- Axis labels -->
    {#each xTicks as tick}
      <text x={scaleX(tick)} y={viewH - 5} class="cy-scatter-chart__tick" text-anchor="middle">{formatNum(tick)}</text>
    {/each}
    {#each yTicks as tick}
      <text x={padding.left - 8} y={scaleY(tick) + 4} class="cy-scatter-chart__tick" text-anchor="end">{formatNum(tick)}</text>
    {/each}

    <!-- Axis names -->
    {#if xLabel}
      <text x={padding.left + plotW / 2} y={viewH - 2} class="cy-scatter-chart__label" text-anchor="middle">{xLabel}</text>
    {/if}
    {#if yLabel}
      <text x={12} y={padding.top + plotH / 2} class="cy-scatter-chart__label" text-anchor="middle" transform="rotate(-90, 12, {padding.top + plotH / 2})">{yLabel}</text>
    {/if}

    <!-- Trend lines -->
    {#if showTrendLine}
      {#each series as s, i}
        {@const trend = computeTrendLine(s.data)}
        {#if trend}
          <line
            x1={scaleX(trend.x1)} y1={scaleY(trend.y1)}
            x2={scaleX(trend.x2)} y2={scaleY(trend.y2)}
            stroke={getColor(s, i)}
            stroke-width="1.5"
            stroke-dasharray="6 4"
            opacity="0.5"
          />
        {/if}
      {/each}
    {/if}

    <!-- Data points -->
    {#each series as s, si}
      {#each s.data as point, _pi}
        <circle
          cx={scaleX(point.x)}
          cy={scaleY(point.y)}
          r={point.size || pointSize}
          fill={point.color || getColor(s, si)}
          class="cy-scatter-chart__point"
          class:cy-scatter-chart__point--animated={animate}
          onmouseenter={(e) => handlePointEnter(point, si, e)}
          onmouseleave={handlePointLeave}
          onclick={() => handlePointClick(point, s.name)}
          role="presentation"
        />
      {/each}
    {/each}
  </svg>

  <!-- Tooltip -->
  {#if showTooltip && hoveredPoint}
    <div class="cy-scatter-chart__tooltip" style="left: {hoveredPoint.x + 12}px; top: {hoveredPoint.y - 8}px;">
      <div class="cy-scatter-chart__tooltip-row">
        <span class="cy-scatter-chart__tooltip-dot" style="background: {getColor(series[hoveredPoint.seriesIdx], hoveredPoint.seriesIdx)}"></span>
        <span class="cy-scatter-chart__tooltip-name">{series[hoveredPoint.seriesIdx].name}</span>
      </div>
      {#if hoveredPoint.point.label}
        <div class="cy-scatter-chart__tooltip-label">{hoveredPoint.point.label}</div>
      {/if}
      <div class="cy-scatter-chart__tooltip-vals">
        <span>x: {formatNum(hoveredPoint.point.x)}</span>
        <span>y: {formatNum(hoveredPoint.point.y)}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .cy-scatter-chart {
    position: relative;
    font-family: var(--font-body, "Inter", sans-serif);
  }

  .cy-scatter-chart__svg {
    width: 100%;
    height: calc(100% - 28px);
    display: block;
  }

  .cy-scatter-chart__grid {
    stroke: var(--color-border-subtle);
    stroke-width: 0.5;
    opacity: 0.3;
  }

  .cy-scatter-chart__axis {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-scatter-chart__tick {
    fill: var(--color-text-tertiary);
    font-size: 9px;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
  }

  .cy-scatter-chart__label {
    fill: var(--color-text-secondary);
    font-size: 10px;
    font-family: var(--font-body, "Inter", sans-serif);
  }

  .cy-scatter-chart__point {
    opacity: 0.8;
    cursor: pointer;
    transition: opacity 150ms ease, r 150ms ease;
  }

  .cy-scatter-chart__point:hover {
    opacity: 1;
    r: 8;
  }

  .cy-scatter-chart__point--animated {
    animation: cy-scatter-fade 0.6s ease-out forwards;
  }

  @keyframes cy-scatter-fade {
    from { opacity: 0; transform: scale(0); }
    to { opacity: 0.8; transform: scale(1); }
  }

  .cy-scatter-chart__legend {
    display: flex;
    gap: 16px;
    justify-content: center;
    padding: 6px 0;
    flex-wrap: wrap;
  }

  .cy-scatter-chart__legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .cy-scatter-chart__legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .cy-scatter-chart__tooltip {
    position: absolute;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 0.75rem;
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .cy-scatter-chart__tooltip-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }

  .cy-scatter-chart__tooltip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .cy-scatter-chart__tooltip-name {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .cy-scatter-chart__tooltip-label {
    color: var(--color-text-secondary);
    margin-bottom: 4px;
  }

  .cy-scatter-chart__tooltip-vals {
    display: flex;
    gap: 12px;
    color: var(--color-text-secondary);
    font-family: var(--font-mono, "JetBrains Mono", monospace);
  }
</style>
