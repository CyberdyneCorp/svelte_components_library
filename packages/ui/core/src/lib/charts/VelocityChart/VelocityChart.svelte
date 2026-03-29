<svelte:options runes={true} />

<script lang="ts">
  type SprintData = { name: string; completed: number; committed?: number };

  let {
    sprints = [],
    width = "100%",
    height = "350px",
    showAverage = true,
    showCommitted = true,
    showValues = true,
    unit = "points",
  }: {
    sprints?: SprintData[];
    width?: string;
    height?: string;
    showAverage?: boolean;
    showCommitted?: boolean;
    showValues?: boolean;
    unit?: string;
  } = $props();

  const viewW = 600;
  const viewH = 300;
  const padding = { top: 30, right: 60, bottom: 50, left: 50 };
  const plotW = viewW - padding.left - padding.right;
  const plotH = viewH - padding.top - padding.bottom;

  let hoveredIndex: number | null = $state(null);
  let mousePos = $state({ x: 0, y: 0 });

  let maxVal = $derived(
    sprints.length
      ? Math.max(
          ...sprints.map((s) => Math.max(s.completed, s.committed ?? 0)),
          1
        )
      : 1
  );

  let avgVelocity = $derived(
    sprints.length
      ? sprints.reduce((sum, s) => sum + s.completed, 0) / sprints.length
      : 0
  );

  function scaleY(val: number): number {
    return padding.top + plotH - (val / maxVal) * plotH;
  }

  function getBarColor(sprint: SprintData): string {
    if (sprint.committed !== undefined && sprint.completed < sprint.committed) {
      return "var(--color-state-warning)";
    }
    return "var(--color-action-brand-default)";
  }

  function niceSteps(max: number, count: number): number[] {
    const step = max / count;
    return Array.from({ length: count + 1 }, (_, i) => Math.round(step * i));
  }

  let yTicks = $derived(niceSteps(maxVal, 4));

  function onMouseMove(e: MouseEvent) {
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
</script>

<div class="cy-velocity" style="width: {width}; height: {height};">
  <svg
    viewBox="0 0 {viewW} {viewH}"
    preserveAspectRatio="xMidYMid meet"
    class="cy-velocity__svg"
    onmousemove={onMouseMove}
    role="img"
    aria-label="Velocity chart"
  >
    <!-- Grid -->
    {#each yTicks as tick}
      <line
        x1={padding.left} y1={scaleY(tick)}
        x2={viewW - padding.right} y2={scaleY(tick)}
        class="cy-velocity__grid"
      />
      <text
        x={padding.left - 8} y={scaleY(tick) + 4}
        class="cy-velocity__tick"
        text-anchor="end"
      >{tick}</text>
    {/each}

    <!-- Axes -->
    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} class="cy-velocity__axis" />
    <line x1={padding.left} y1={padding.top + plotH} x2={viewW - padding.right} y2={padding.top + plotH} class="cy-velocity__axis" />

    <!-- Unit label -->
    <text x={padding.left - 8} y={padding.top - 8} class="cy-velocity__unit" text-anchor="end">{unit}</text>

    <!-- Bars -->
    {#each sprints as sprint, i}
      {@const barGap = 0.2}
      {@const slotW = plotW / sprints.length}
      {@const barW = slotW * (1 - barGap)}
      {@const barX = padding.left + slotW * i + slotW * barGap / 2}
      {@const completedH = (sprint.completed / maxVal) * plotH}
      {@const committedH = sprint.committed !== undefined ? (sprint.committed / maxVal) * plotH : 0}
      {@const isHovered = hoveredIndex === i}

      <!-- Committed bar (outline behind) -->
      {#if showCommitted && sprint.committed !== undefined}
        <rect
          x={barX}
          y={padding.top + plotH - committedH}
          width={barW}
          height={committedH}
          fill="none"
          stroke="var(--color-text-tertiary)"
          stroke-width="1.5"
          stroke-dasharray="4 2"
          rx="2"
          class="cy-velocity__committed-bar"
        />
      {/if}

      <!-- Completed bar -->
      <rect
        x={barX}
        y={padding.top + plotH - completedH}
        width={barW}
        height={completedH}
        fill={getBarColor(sprint)}
        opacity={isHovered ? 1 : 0.85}
        class="cy-velocity__bar"
        onmouseenter={() => hoveredIndex = i}
        onmouseleave={() => hoveredIndex = null}
        role="presentation"
      />

      <!-- Value on top -->
      {#if showValues}
        <text
          x={barX + barW / 2}
          y={padding.top + plotH - completedH - 6}
          class="cy-velocity__value"
          text-anchor="middle"
        >{sprint.completed}</text>
      {/if}

      <!-- Sprint name -->
      <text
        x={barX + barW / 2}
        y={padding.top + plotH + 16}
        class="cy-velocity__label"
        text-anchor="middle"
      >{sprint.name}</text>
    {/each}

    <!-- Average line -->
    {#if showAverage && sprints.length > 0}
      <line
        x1={padding.left} y1={scaleY(avgVelocity)}
        x2={viewW - padding.right} y2={scaleY(avgVelocity)}
        class="cy-velocity__avg-line"
      />
      <text
        x={viewW - padding.right + 4} y={scaleY(avgVelocity) + 4}
        class="cy-velocity__avg-label"
        text-anchor="start"
      >Avg: {Math.round(avgVelocity)}</text>
    {/if}
  </svg>

  {#if hoveredIndex !== null && sprints[hoveredIndex]}
    {@const sprint = sprints[hoveredIndex]}
    <div class="cy-velocity__tooltip" style="left: {mousePos.x + 12}px; top: {mousePos.y - 8}px;">
      <div class="cy-velocity__tooltip-title">{sprint.name}</div>
      <div class="cy-velocity__tooltip-row">Completed: {sprint.completed} {unit}</div>
      {#if sprint.committed !== undefined}
        <div class="cy-velocity__tooltip-row">Committed: {sprint.committed} {unit}</div>
        <div class="cy-velocity__tooltip-row">Delta: {sprint.completed - sprint.committed > 0 ? "+" : ""}{sprint.completed - sprint.committed} {unit}</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .cy-velocity {
    position: relative;
    font-family: var(--font-body);
  }

  .cy-velocity__svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .cy-velocity__grid {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-velocity__axis {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-velocity__tick {
    font-size: 9px;
    fill: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }

  .cy-velocity__unit {
    font-size: 9px;
    fill: var(--color-text-secondary);
    font-family: var(--font-mono);
  }

  .cy-velocity__bar {
    transition: opacity 150ms ease;
    rx: 2;
  }

  .cy-velocity__committed-bar {
    opacity: 0.6;
  }

  .cy-velocity__value {
    font-size: 9px;
    fill: var(--color-text-primary);
    font-family: var(--font-mono);
  }

  .cy-velocity__label {
    font-size: 8px;
    fill: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-velocity__avg-line {
    stroke: var(--color-action-secondary-default);
    stroke-width: 1.5;
    stroke-dasharray: 6 3;
  }

  .cy-velocity__avg-label {
    font-size: 9px;
    fill: var(--color-action-secondary-default);
    font-family: var(--font-mono);
  }

  .cy-velocity__tooltip {
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

  .cy-velocity__tooltip-title {
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 4px;
  }

  .cy-velocity__tooltip-row {
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 0.7rem;
  }
</style>
