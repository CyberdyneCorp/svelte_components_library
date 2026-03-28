<svelte:options runes={true} />

<script lang="ts">
  type DataPoint = { x: number; y: number };
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
  } = $props();

  const defaultColors = ["#00ff41", "#00d4ff", "#bf5af2", "#ffb800"];
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const viewW = 600;
  const viewH = 300;
  const plotW = viewW - padding.left - padding.right;
  const plotH = viewH - padding.top - padding.bottom;

  let hoverX: number | null = $state(null);
  let mousePos = $state({ x: 0, y: 0 });

  let allPoints = $derived(series.flatMap((s) => s.data));
  let xMin = $derived(allPoints.length ? Math.min(...allPoints.map((p) => p.x)) : 0);
  let xMax = $derived(allPoints.length ? Math.max(...allPoints.map((p) => p.x)) : 1);
  let yMin = $derived(allPoints.length ? Math.min(...allPoints.map((p) => p.y)) : 0);
  let yMax = $derived(allPoints.length ? Math.max(...allPoints.map((p) => p.y)) : 1);

  let yRange = $derived(yMax - yMin || 1);
  let xRange = $derived(xMax - xMin || 1);
  let yPadded = $derived({ min: yMin - yRange * 0.05, max: yMax + yRange * 0.05 });

  function scaleX(val: number): number {
    return padding.left + ((val - xMin) / xRange) * plotW;
  }

  function scaleY(val: number): number {
    return padding.top + plotH - ((val - yPadded.min) / (yPadded.max - yPadded.min)) * plotH;
  }

  function pathForSeries(s: Series): string {
    if (s.data.length === 0) return "";
    const sorted = [...s.data].sort((a, b) => a.x - b.x);
    return sorted.map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.x)},${scaleY(p.y)}`).join(" ");
  }

  function niceSteps(min: number, max: number, count: number): number[] {
    const range = max - min || 1;
    const step = range / (count - 1);
    return Array.from({ length: count }, (_, i) => min + step * i);
  }

  let xTicks = $derived(niceSteps(xMin, xMax, 6));
  let yTicks = $derived(niceSteps(yPadded.min, yPadded.max, 5));

  function getColor(s: Series, i: number): string {
    return s.color || defaultColors[i % defaultColors.length];
  }

  function onMouseMove(e: MouseEvent) {
    const svg = (e.currentTarget as SVGSVGElement);
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * viewW;
    const dataX = xMin + ((svgX - padding.left) / plotW) * xRange;
    if (dataX >= xMin && dataX <= xMax) {
      hoverX = dataX;
      mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    } else {
      hoverX = null;
    }
  }

  function onMouseLeave() {
    hoverX = null;
  }

  function closestPoint(s: Series, targetX: number): DataPoint | null {
    if (s.data.length === 0) return null;
    return s.data.reduce((closest, p) =>
      Math.abs(p.x - targetX) < Math.abs(closest.x - targetX) ? p : closest
    );
  }

  function formatNum(n: number): string {
    return Number.isInteger(n) ? n.toString() : n.toFixed(2);
  }
</script>

<div class="cy-line-chart" style="width: {width}; height: {height};">
  <svg
    viewBox="0 0 {viewW} {viewH}"
    preserveAspectRatio="xMidYMid meet"
    class="cy-line-chart__svg"
    onmousemove={onMouseMove}
    onmouseleave={onMouseLeave}
  >
    {#if showGrid}
      {#each yTicks as tick}
        <line
          x1={padding.left} y1={scaleY(tick)}
          x2={viewW - padding.right} y2={scaleY(tick)}
          class="cy-line-chart__grid"
        />
      {/each}
      {#each xTicks as tick}
        <line
          x1={scaleX(tick)} y1={padding.top}
          x2={scaleX(tick)} y2={padding.top + plotH}
          class="cy-line-chart__grid"
        />
      {/each}
    {/if}

    <!-- Axes -->
    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} class="cy-line-chart__axis" />
    <line x1={padding.left} y1={padding.top + plotH} x2={viewW - padding.right} y2={padding.top + plotH} class="cy-line-chart__axis" />

    <!-- Tick labels -->
    {#each xTicks as tick}
      <text x={scaleX(tick)} y={padding.top + plotH + 16} class="cy-line-chart__tick-label" text-anchor="middle">{formatNum(tick)}</text>
    {/each}
    {#each yTicks as tick}
      <text x={padding.left - 8} y={scaleY(tick) + 4} class="cy-line-chart__tick-label" text-anchor="end">{formatNum(tick)}</text>
    {/each}

    <!-- Axis labels -->
    {#if xLabel}
      <text x={padding.left + plotW / 2} y={viewH - 4} class="cy-line-chart__axis-label" text-anchor="middle">{xLabel}</text>
    {/if}
    {#if yLabel}
      <text x={12} y={padding.top + plotH / 2} class="cy-line-chart__axis-label" text-anchor="middle" transform="rotate(-90, 12, {padding.top + plotH / 2})">{yLabel}</text>
    {/if}

    <!-- Series lines -->
    {#each series as s, i}
      <path
        d={pathForSeries(s)}
        fill="none"
        stroke={getColor(s, i)}
        stroke-width="2"
        class="cy-line-chart__line"
        class:cy-line-chart__line--animated={animate}
      />
    {/each}

    <!-- Hover crosshair -->
    {#if showTooltip && hoverX !== null}
      <line
        x1={scaleX(hoverX)} y1={padding.top}
        x2={scaleX(hoverX)} y2={padding.top + plotH}
        class="cy-line-chart__crosshair"
      />
      {#each series as s, i}
        {@const pt = closestPoint(s, hoverX)}
        {#if pt}
          <circle
            cx={scaleX(pt.x)}
            cy={scaleY(pt.y)}
            r="4"
            fill={getColor(s, i)}
            class="cy-line-chart__dot"
          />
        {/if}
      {/each}
    {/if}
  </svg>

  <!-- Tooltip overlay -->
  {#if showTooltip && hoverX !== null}
    <div class="cy-line-chart__tooltip" style="left: {mousePos.x + 12}px; top: {mousePos.y - 8}px;">
      {#each series as s, i}
        {@const pt = closestPoint(s, hoverX)}
        {#if pt}
          <div class="cy-line-chart__tooltip-row">
            <span class="cy-line-chart__tooltip-dot" style="background: {getColor(s, i)}"></span>
            <span class="cy-line-chart__tooltip-name">{s.name}:</span>
            <span class="cy-line-chart__tooltip-val">{formatNum(pt.y)}</span>
          </div>
        {/if}
      {/each}
    </div>
  {/if}

  {#if showLegend && series.length > 0}
    <div class="cy-line-chart__legend">
      {#each series as s, i}
        <div class="cy-line-chart__legend-item">
          <span class="cy-line-chart__legend-dot" style="background: {getColor(s, i)}"></span>
          <span>{s.name}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cy-line-chart {
    position: relative;
    font-family: var(--font-body);
  }

  .cy-line-chart__svg {
    width: 100%;
    height: calc(100% - 28px);
    display: block;
  }

  .cy-line-chart__grid {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-line-chart__axis {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-line-chart__tick-label {
    font-size: 9px;
    fill: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }

  .cy-line-chart__axis-label {
    font-size: 10px;
    fill: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-line-chart__line {
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .cy-line-chart__line--animated {
    stroke-dasharray: 2000;
    stroke-dashoffset: 2000;
    animation: cy-line-draw 1.5s ease forwards;
  }

  @keyframes cy-line-draw {
    to { stroke-dashoffset: 0; }
  }

  .cy-line-chart__crosshair {
    stroke: var(--color-text-tertiary);
    stroke-width: 1;
    stroke-dasharray: 4 2;
  }

  .cy-line-chart__dot {
    filter: drop-shadow(0 0 4px currentColor);
  }

  .cy-line-chart__tooltip {
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

  .cy-line-chart__tooltip-row {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-text-primary);
  }

  .cy-line-chart__tooltip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .cy-line-chart__tooltip-name {
    color: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-line-chart__tooltip-val {
    font-family: var(--font-mono);
    color: var(--color-text-primary);
  }

  .cy-line-chart__legend {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    padding-top: var(--space-2);
  }

  .cy-line-chart__legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .cy-line-chart__legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
</style>
