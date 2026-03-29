<svelte:options runes={true} />

<script lang="ts">
  type BarData = { label: string; value: number; color?: string };

  let {
    data = [],
    width = "100%",
    height = "300px",
    horizontal = false,
    showValues = true,
    showGrid = true,
    animate = true,
    barColor = "#00ff41",
  }: {
    data?: BarData[];
    width?: string;
    height?: string;
    horizontal?: boolean;
    showValues?: boolean;
    showGrid?: boolean;
    animate?: boolean;
    barColor?: string;
  } = $props();

  const viewW = 600;
  const viewH = 300;
  let padding = $derived(horizontal
    ? { top: 20, right: 40, bottom: 30, left: 80 }
    : { top: 20, right: 20, bottom: 50, left: 50 });

  let plotW = $derived(viewW - padding.left - padding.right);
  let plotH = $derived(viewH - padding.top - padding.bottom);
  let maxVal = $derived(data.length ? Math.max(...data.map((d) => d.value)) : 1);

  let hoveredIndex: number | null = $state(null);

  function getBarColor(d: BarData): string {
    return d.color || barColor;
  }

  function formatNum(n: number): string {
    return Number.isInteger(n) ? n.toString() : n.toFixed(2);
  }

  function gridTicks(max: number, count: number): number[] {
    const step = max / count;
    return Array.from({ length: count + 1 }, (_, i) => step * i);
  }

  let ticks = $derived(gridTicks(maxVal, 4));
</script>

<div class="cy-bar-chart" style="width: {width}; height: {height};">
  <svg
    viewBox="0 0 {viewW} {viewH}"
    preserveAspectRatio="xMidYMid meet"
    class="cy-bar-chart__svg"
    role="img"
    aria-label="Bar chart"
  >
    {#if showGrid}
      {#each ticks as tick}
        {#if horizontal}
          <line
            x1={padding.left + (tick / maxVal) * plotW}
            y1={padding.top}
            x2={padding.left + (tick / maxVal) * plotW}
            y2={padding.top + plotH}
            class="cy-bar-chart__grid"
          />
        {:else}
          <line
            x1={padding.left}
            y1={padding.top + plotH - (tick / maxVal) * plotH}
            x2={viewW - padding.right}
            y2={padding.top + plotH - (tick / maxVal) * plotH}
            class="cy-bar-chart__grid"
          />
        {/if}
      {/each}
    {/if}

    <!-- Axis lines -->
    {#if horizontal}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} class="cy-bar-chart__axis" />
    {:else}
      <line x1={padding.left} y1={padding.top + plotH} x2={viewW - padding.right} y2={padding.top + plotH} class="cy-bar-chart__axis" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} class="cy-bar-chart__axis" />
    {/if}

    <!-- Tick labels for value axis -->
    {#each ticks as tick}
      {#if horizontal}
        <text
          x={padding.left + (tick / maxVal) * plotW}
          y={padding.top + plotH + 16}
          class="cy-bar-chart__tick"
          text-anchor="middle"
        >{formatNum(tick)}</text>
      {:else}
        <text
          x={padding.left - 8}
          y={padding.top + plotH - (tick / maxVal) * plotH + 4}
          class="cy-bar-chart__tick"
          text-anchor="end"
        >{formatNum(tick)}</text>
      {/if}
    {/each}

    <!-- Bars -->
    {#each data as d, i}
      {@const barGap = 0.2}
      {@const color = getBarColor(d)}
      {@const isHovered = hoveredIndex === i}
      {#if horizontal}
        {@const barH = (plotH / data.length) * (1 - barGap)}
        {@const barY = padding.top + (plotH / data.length) * i + (plotH / data.length) * barGap / 2}
        {@const barW = (d.value / maxVal) * plotW}
        <rect
          x={padding.left}
          y={barY}
          width={barW}
          height={barH}
          fill={color}
          opacity={isHovered ? 1 : 0.85}
          class="cy-bar-chart__bar"
          class:cy-bar-chart__bar--animated={animate}
          style={isHovered ? `filter: drop-shadow(0 0 8px ${color})` : ""}
          onmouseenter={() => hoveredIndex = i}
          onmouseleave={() => hoveredIndex = null}
          role="presentation"
        />
        <text
          x={padding.left - 6}
          y={barY + barH / 2 + 4}
          class="cy-bar-chart__label"
          text-anchor="end"
        >{d.label}</text>
        {#if showValues}
          <text
            x={padding.left + barW + 6}
            y={barY + barH / 2 + 4}
            class="cy-bar-chart__value"
          >{formatNum(d.value)}</text>
        {/if}
      {:else}
        {@const barW = (plotW / data.length) * (1 - barGap)}
        {@const barX = padding.left + (plotW / data.length) * i + (plotW / data.length) * barGap / 2}
        {@const barH = (d.value / maxVal) * plotH}
        <rect
          x={barX}
          y={padding.top + plotH - barH}
          width={barW}
          height={barH}
          fill={color}
          opacity={isHovered ? 1 : 0.85}
          class="cy-bar-chart__bar"
          class:cy-bar-chart__bar--animated={animate}
          style={isHovered ? `filter: drop-shadow(0 0 8px ${color})` : ""}
          onmouseenter={() => hoveredIndex = i}
          onmouseleave={() => hoveredIndex = null}
          role="presentation"
        />
        <text
          x={barX + barW / 2}
          y={padding.top + plotH + 16}
          class="cy-bar-chart__label"
          text-anchor="middle"
        >{d.label}</text>
        {#if showValues}
          <text
            x={barX + barW / 2}
            y={padding.top + plotH - barH - 6}
            class="cy-bar-chart__value"
            text-anchor="middle"
          >{formatNum(d.value)}</text>
        {/if}
      {/if}
    {/each}
  </svg>
</div>

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

  .cy-bar-chart__value {
    font-size: 9px;
    fill: var(--color-text-primary);
    font-family: var(--font-mono);
  }
</style>
