<svelte:options runes={true} />

<script lang="ts">
  type WipItem = {
    id: string;
    title: string;
    status: string;
    daysInProgress: number;
    assignee?: string;
  };

  let {
    items = [],
    warningThreshold = 5,
    criticalThreshold = 10,
    width = "100%",
    height = "350px",
    showThresholds = true,
    onitemclick,
  }: {
    items?: WipItem[];
    warningThreshold?: number;
    criticalThreshold?: number;
    width?: string;
    height?: string;
    showThresholds?: boolean;
    onitemclick?: (item: WipItem) => void;
  } = $props();

  const viewW = 600;
  const viewH = 300;
  const padding = { top: 20, right: 30, bottom: 30, left: 140 };
  const plotW = viewW - padding.left - padding.right;
  const plotH = viewH - padding.top - padding.bottom;

  let hoveredIndex: number | null = $state(null);
  let mousePos = $state({ x: 0, y: 0 });

  let sortedItems = $derived(
    [...items].sort((a, b) => b.daysInProgress - a.daysInProgress)
  );

  let maxDays = $derived(
    sortedItems.length ? Math.max(...sortedItems.map((d) => d.daysInProgress), criticalThreshold + 2) : criticalThreshold + 2
  );

  function scaleX(days: number): number {
    return padding.left + (days / maxDays) * plotW;
  }

  function getBarColor(days: number): string {
    if (days >= criticalThreshold) return "var(--color-state-error)";
    if (days >= warningThreshold) return "var(--color-state-warning)";
    return "var(--color-action-brand-default)";
  }

  function truncate(text: string, max: number): string {
    return text.length > max ? text.slice(0, max - 1) + "\u2026" : text;
  }

  function niceSteps(max: number, count: number): number[] {
    const step = Math.ceil(max / count);
    return Array.from({ length: count + 1 }, (_, i) => i * step).filter((v) => v <= max + step);
  }

  let xTicks = $derived(niceSteps(maxDays, 5));

  function handleClick(item: WipItem) {
    onitemclick?.(item);
  }

  function onMouseMove(e: MouseEvent) {
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
</script>

<div class="cy-aging-wip" style="width: {width}; height: {height};">
  <svg
    viewBox="0 0 {viewW} {viewH}"
    preserveAspectRatio="xMidYMid meet"
    class="cy-aging-wip__svg"
    onmousemove={onMouseMove}
    role="img"
    aria-label="Aging Work in Progress chart"
  >
    <!-- Grid -->
    {#each xTicks as tick}
      <line
        x1={scaleX(tick)} y1={padding.top}
        x2={scaleX(tick)} y2={padding.top + plotH}
        class="cy-aging-wip__grid"
      />
      <text
        x={scaleX(tick)} y={padding.top + plotH + 16}
        class="cy-aging-wip__tick"
        text-anchor="middle"
      >{tick}d</text>
    {/each}

    <!-- Axes -->
    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} class="cy-aging-wip__axis" />
    <line x1={padding.left} y1={padding.top + plotH} x2={viewW - padding.right} y2={padding.top + plotH} class="cy-aging-wip__axis" />

    <!-- Threshold lines -->
    {#if showThresholds}
      <line
        x1={scaleX(warningThreshold)} y1={padding.top}
        x2={scaleX(warningThreshold)} y2={padding.top + plotH}
        class="cy-aging-wip__threshold cy-aging-wip__threshold--warning"
      />
      <text
        x={scaleX(warningThreshold)} y={padding.top - 4}
        class="cy-aging-wip__threshold-label cy-aging-wip__threshold-label--warning"
        text-anchor="middle"
      >Warning ({warningThreshold}d)</text>

      <line
        x1={scaleX(criticalThreshold)} y1={padding.top}
        x2={scaleX(criticalThreshold)} y2={padding.top + plotH}
        class="cy-aging-wip__threshold cy-aging-wip__threshold--critical"
      />
      <text
        x={scaleX(criticalThreshold)} y={padding.top - 4}
        class="cy-aging-wip__threshold-label cy-aging-wip__threshold-label--critical"
        text-anchor="middle"
      >Critical ({criticalThreshold}d)</text>
    {/if}

    <!-- Bars -->
    {#each sortedItems as item, i}
      {@const barGap = 0.15}
      {@const barH = sortedItems.length > 0 ? (plotH / sortedItems.length) * (1 - barGap) : 0}
      {@const barY = padding.top + (plotH / sortedItems.length) * i + (plotH / sortedItems.length) * barGap / 2}
      {@const barW = (item.daysInProgress / maxDays) * plotW}
      {@const color = getBarColor(item.daysInProgress)}
      {@const isHovered = hoveredIndex === i}

      <!-- Item label -->
      <text
        x={padding.left - 6}
        y={barY + barH / 2 + 4}
        class="cy-aging-wip__label"
        text-anchor="end"
      >{truncate(item.title, 18)}</text>

      <!-- Bar -->
      <rect
        x={padding.left}
        y={barY}
        width={barW}
        height={barH}
        fill={color}
        opacity={isHovered ? 1 : 0.85}
        class="cy-aging-wip__bar"
        style={isHovered ? `filter: drop-shadow(0 0 6px ${color === 'var(--color-state-error)' ? 'red' : color === 'var(--color-state-warning)' ? 'orange' : 'green'})` : ""}
        onmouseenter={() => hoveredIndex = i}
        onmouseleave={() => hoveredIndex = null}
        onclick={() => handleClick(item)}
        role="button"
        tabindex="0"
        onkeydown={(e) => { if (e.key === 'Enter') handleClick(item); }}
      />

      <!-- Days label on bar -->
      <text
        x={padding.left + barW + 6}
        y={barY + barH / 2 + 4}
        class="cy-aging-wip__days"
      >{item.daysInProgress}d</text>
    {/each}
  </svg>

  {#if hoveredIndex !== null && sortedItems[hoveredIndex]}
    {@const item = sortedItems[hoveredIndex]}
    <div class="cy-aging-wip__tooltip" style="left: {mousePos.x + 12}px; top: {mousePos.y - 8}px;">
      <div class="cy-aging-wip__tooltip-title">{item.title}</div>
      <div class="cy-aging-wip__tooltip-row">Status: {item.status}</div>
      {#if item.assignee}
        <div class="cy-aging-wip__tooltip-row">Assignee: {item.assignee}</div>
      {/if}
      <div class="cy-aging-wip__tooltip-row">Days in progress: {item.daysInProgress}</div>
    </div>
  {/if}
</div>

<style>
  .cy-aging-wip {
    position: relative;
    font-family: var(--font-body);
  }

  .cy-aging-wip__svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .cy-aging-wip__grid {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-aging-wip__axis {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-aging-wip__tick {
    font-size: 9px;
    fill: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }

  .cy-aging-wip__threshold {
    stroke-width: 1.5;
    stroke-dasharray: 6 3;
  }

  .cy-aging-wip__threshold--warning {
    stroke: var(--color-state-warning);
  }

  .cy-aging-wip__threshold--critical {
    stroke: var(--color-state-error);
  }

  .cy-aging-wip__threshold-label {
    font-size: 8px;
    font-family: var(--font-mono);
  }

  .cy-aging-wip__threshold-label--warning {
    fill: var(--color-state-warning);
  }

  .cy-aging-wip__threshold-label--critical {
    fill: var(--color-state-error);
  }

  .cy-aging-wip__bar {
    transition: opacity 150ms ease, filter 150ms ease;
    rx: 2;
    cursor: pointer;
  }

  .cy-aging-wip__label {
    font-size: 9px;
    fill: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-aging-wip__days {
    font-size: 9px;
    fill: var(--color-text-primary);
    font-family: var(--font-mono);
  }

  .cy-aging-wip__tooltip {
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

  .cy-aging-wip__tooltip-title {
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 4px;
  }

  .cy-aging-wip__tooltip-row {
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 0.7rem;
  }
</style>
