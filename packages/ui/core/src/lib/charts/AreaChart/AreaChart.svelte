<svelte:options runes={true} />

<script lang="ts">
  type DataPoint = { x: number; y: number };
  type Series = { name: string; data: DataPoint[]; color?: string };

  let {
    series = [],
    stacked = false,
    width = "100%",
    height = "300px",
    showGrid = true,
    showLegend = true,
    showTooltip = true,
  }: {
    series?: Series[];
    stacked?: boolean;
    width?: string;
    height?: string;
    showGrid?: boolean;
    showLegend?: boolean;
    showTooltip?: boolean;
  } = $props();

  const defaultColors = ["#00ff41", "#00d4ff", "#bf5af2", "#ffb800"];
  const viewW = 600;
  const viewH = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const plotW = viewW - padding.left - padding.right;
  const plotH = viewH - padding.top - padding.bottom;

  let hoverX: number | null = $state(null);
  let mousePos = $state({ x: 0, y: 0 });

  function getColor(s: Series, i: number): string {
    return s.color || defaultColors[i % defaultColors.length];
  }

  // Sort each series by x
  let sortedSeries = $derived(
    series.map((s) => ({ ...s, data: [...s.data].sort((a, b) => a.x - b.x) }))
  );

  // Compute stacked data if needed
  let stackedData = $derived.by(() => {
    if (!stacked || sortedSeries.length === 0) return sortedSeries;

    // Collect all unique x values
    const allX = [...new Set(sortedSeries.flatMap((s) => s.data.map((p) => p.x)))].sort((a, b) => a - b);

    const result: typeof sortedSeries = [];
    const cumulative = new Map<number, number>();
    allX.forEach((x) => cumulative.set(x, 0));

    for (const s of sortedSeries) {
      const dataMap = new Map(s.data.map((p) => [p.x, p.y]));
      const newData: DataPoint[] = [];
      for (const x of allX) {
        const val = (dataMap.get(x) ?? 0) + (cumulative.get(x) ?? 0);
        newData.push({ x, y: val });
        cumulative.set(x, val);
      }
      result.push({ ...s, data: newData });
    }
    return result;
  });

  let displaySeries = $derived(stacked ? stackedData : sortedSeries);

  let allPoints = $derived(displaySeries.flatMap((s) => s.data));
  let xMin = $derived(allPoints.length ? Math.min(...allPoints.map((p) => p.x)) : 0);
  let xMax = $derived(allPoints.length ? Math.max(...allPoints.map((p) => p.x)) : 1);
  let yMin = $derived(0);
  let yMax = $derived(allPoints.length ? Math.max(...allPoints.map((p) => p.y)) : 1);
  let xRange = $derived(xMax - xMin || 1);
  let yRange = $derived(yMax - yMin || 1);
  let yPaddedMax = $derived(yMax + yRange * 0.05);

  function scaleX(val: number): number {
    return padding.left + ((val - xMin) / xRange) * plotW;
  }

  function scaleY(val: number): number {
    return padding.top + plotH - ((val - yMin) / (yPaddedMax - yMin)) * plotH;
  }

  function linePath(data: DataPoint[]): string {
    if (data.length === 0) return "";
    return data.map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.x)},${scaleY(p.y)}`).join(" ");
  }

  function areaPath(data: DataPoint[], baseData?: DataPoint[]): string {
    if (data.length === 0) return "";
    let path = data.map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.x)},${scaleY(p.y)}`).join(" ");
    if (baseData && baseData.length > 0) {
      const reversed = [...baseData].reverse();
      path += " " + reversed.map((p) => `L${scaleX(p.x)},${scaleY(p.y)}`).join(" ");
    } else {
      path += ` L${scaleX(data[data.length - 1].x)},${scaleY(0)} L${scaleX(data[0].x)},${scaleY(0)}`;
    }
    path += " Z";
    return path;
  }

  function niceSteps(min: number, max: number, count: number): number[] {
    const range = max - min || 1;
    const step = range / (count - 1);
    return Array.from({ length: count }, (_, i) => min + step * i);
  }

  let xTicks = $derived(niceSteps(xMin, xMax, 6));
  let yTicks = $derived(niceSteps(yMin, yPaddedMax, 5));

  function formatNum(n: number): string {
    return Number.isInteger(n) ? n.toString() : n.toFixed(2);
  }

  function onMouseMove(e: MouseEvent) {
    const svg = e.currentTarget as SVGSVGElement;
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

  function closestPoint(data: DataPoint[], targetX: number): DataPoint | null {
    if (data.length === 0) return null;
    return data.reduce((c, p) => (Math.abs(p.x - targetX) < Math.abs(c.x - targetX) ? p : c));
  }
</script>

<div class="cy-area-chart" style="width: {width}; height: {height};">
  <svg
    viewBox="0 0 {viewW} {viewH}"
    preserveAspectRatio="xMidYMid meet"
    class="cy-area-chart__svg"
    onmousemove={onMouseMove}
    onmouseleave={onMouseLeave}
  >
    <defs>
      {#each displaySeries as s, i}
        <linearGradient id="area-grad-{i}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color={getColor(s, i)} stop-opacity="0.4" />
          <stop offset="100%" stop-color={getColor(s, i)} stop-opacity="0.02" />
        </linearGradient>
      {/each}
    </defs>

    {#if showGrid}
      {#each yTicks as tick}
        <line x1={padding.left} y1={scaleY(tick)} x2={viewW - padding.right} y2={scaleY(tick)} class="cy-area-chart__grid" />
      {/each}
      {#each xTicks as tick}
        <line x1={scaleX(tick)} y1={padding.top} x2={scaleX(tick)} y2={padding.top + plotH} class="cy-area-chart__grid" />
      {/each}
    {/if}

    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} class="cy-area-chart__axis" />
    <line x1={padding.left} y1={padding.top + plotH} x2={viewW - padding.right} y2={padding.top + plotH} class="cy-area-chart__axis" />

    {#each xTicks as tick}
      <text x={scaleX(tick)} y={padding.top + plotH + 16} class="cy-area-chart__tick" text-anchor="middle">{formatNum(tick)}</text>
    {/each}
    {#each yTicks as tick}
      <text x={padding.left - 8} y={scaleY(tick) + 4} class="cy-area-chart__tick" text-anchor="end">{formatNum(tick)}</text>
    {/each}

    <!-- Areas (render in reverse so first series is on top) -->
    {#each [...displaySeries].reverse() as s, ri}
      {@const i = displaySeries.length - 1 - ri}
      {@const baseData = stacked && i > 0 ? displaySeries[i - 1].data : undefined}
      <path
        d={areaPath(s.data, baseData)}
        fill="url(#area-grad-{i})"
        class="cy-area-chart__area"
      />
      <path
        d={linePath(s.data)}
        fill="none"
        stroke={getColor(s, i)}
        stroke-width="2"
        class="cy-area-chart__line"
      />
    {/each}

    {#if showTooltip && hoverX !== null}
      <line
        x1={scaleX(hoverX)} y1={padding.top}
        x2={scaleX(hoverX)} y2={padding.top + plotH}
        class="cy-area-chart__crosshair"
      />
      {#each displaySeries as s, i}
        {@const pt = closestPoint(s.data, hoverX)}
        {#if pt}
          <circle cx={scaleX(pt.x)} cy={scaleY(pt.y)} r="4" fill={getColor(s, i)} class="cy-area-chart__dot" />
        {/if}
      {/each}
    {/if}
  </svg>

  {#if showTooltip && hoverX !== null}
    <div class="cy-area-chart__tooltip" style="left: {mousePos.x + 12}px; top: {mousePos.y - 8}px;">
      {#each sortedSeries as s, i}
        {@const pt = closestPoint(s.data, hoverX)}
        {#if pt}
          <div class="cy-area-chart__tooltip-row">
            <span class="cy-area-chart__tooltip-dot" style="background: {getColor(s, i)}"></span>
            <span class="cy-area-chart__tooltip-name">{s.name}:</span>
            <span class="cy-area-chart__tooltip-val">{formatNum(pt.y)}</span>
          </div>
        {/if}
      {/each}
    </div>
  {/if}

  {#if showLegend && series.length > 0}
    <div class="cy-area-chart__legend">
      {#each series as s, i}
        <div class="cy-area-chart__legend-item">
          <span class="cy-area-chart__legend-dot" style="background: {getColor(s, i)}"></span>
          <span>{s.name}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cy-area-chart {
    position: relative;
    font-family: var(--font-body);
  }

  .cy-area-chart__svg {
    width: 100%;
    height: calc(100% - 28px);
    display: block;
  }

  .cy-area-chart__grid {
    stroke: rgba(255, 255, 255, 0.06);
    stroke-width: 1;
  }

  .cy-area-chart__axis {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-area-chart__tick {
    font-size: 9px;
    fill: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }

  .cy-area-chart__area {
    opacity: 0.8;
  }

  .cy-area-chart__line {
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .cy-area-chart__crosshair {
    stroke: rgba(255, 255, 255, 0.2);
    stroke-width: 1;
    stroke-dasharray: 4 2;
  }

  .cy-area-chart__dot {
    filter: drop-shadow(0 0 4px currentColor);
  }

  .cy-area-chart__tooltip {
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

  .cy-area-chart__tooltip-row {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-text-primary);
  }

  .cy-area-chart__tooltip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .cy-area-chart__tooltip-name {
    color: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-area-chart__tooltip-val {
    font-family: var(--font-mono);
    color: var(--color-text-primary);
  }

  .cy-area-chart__legend {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    padding-top: var(--space-2);
  }

  .cy-area-chart__legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .cy-area-chart__legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
</style>
