<svelte:options runes={true} />

<script module lang="ts">
  export type TreeNode = { label: string; value: number; color?: string; children?: TreeNode[] };
</script>

<script lang="ts">
  type Rect = { x: number; y: number; w: number; h: number; node: TreeNode; color: string; depth: number };

  let {
    data = [],
    width = "100%",
    height = "300px",
    showLabels = true,
    showValues = true,
  }: {
    data?: TreeNode[];
    width?: string;
    height?: string;
    showLabels?: boolean;
    showValues?: boolean;
  } = $props();

  const defaultColors = [
    "var(--color-action-brand-default)",
    "var(--color-action-secondary-default)",
    "var(--color-action-tertiary-default)",
    "var(--color-state-warning)",
    "var(--color-state-error)",
  ];

  let hoveredRect: Rect | null = $state(null);
  let tooltipPos = $state({ x: 0, y: 0 });
  let containerEl: HTMLDivElement | undefined = $state(undefined);
  let containerW = $state(400);
  let containerH = $state(300);

  function getColor(node: TreeNode, index: number): string {
    return node.color || defaultColors[index % defaultColors.length];
  }

  function totalValue(nodes: TreeNode[]): number {
    return nodes.reduce((s, n) => s + n.value, 0);
  }

  function squarify(
    nodes: TreeNode[],
    x: number,
    y: number,
    w: number,
    h: number,
    colorIndex: number,
    depth: number
  ): Rect[] {
    if (!nodes.length || w <= 0 || h <= 0) return [];
    const total = totalValue(nodes);
    if (total <= 0) return [];

    const sorted = [...nodes].sort((a, b) => b.value - a.value);
    const rects: Rect[] = [];
    let cx = x,
      cy = y,
      cw = w,
      ch = h;

    for (let i = 0; i < sorted.length; i++) {
      const node = sorted[i];
      const remaining = totalValue(sorted.slice(i));
      const ratio = node.value / remaining;
      const color = getColor(node, colorIndex + i);

      let rw: number, rh: number;
      if (cw >= ch) {
        rw = cw * ratio;
        rh = ch;
        rects.push({ x: cx, y: cy, w: rw, h: rh, node, color, depth });
        cx += rw;
        cw -= rw;
      } else {
        rw = cw;
        rh = ch * ratio;
        rects.push({ x: cx, y: cy, w: rw, h: rh, node, color, depth });
        cy += rh;
        ch -= rh;
      }
    }

    return rects;
  }

  let rects = $derived(squarify(data, 0, 0, containerW, containerH, 0, 0));

  function percentage(value: number): string {
    const total = totalValue(data);
    return total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "0%";
  }

  function onRectMouseMove(e: MouseEvent, rect: Rect) {
    hoveredRect = rect;
    if (containerEl) {
      const bounds = containerEl.getBoundingClientRect();
      tooltipPos = { x: e.clientX - bounds.left + 12, y: e.clientY - bounds.top - 8 };
    }
  }

  function onRectMouseLeave() {
    hoveredRect = null;
  }

  function measureContainer(el: HTMLDivElement) {
    containerEl = el;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerW = entry.contentRect.width;
        containerH = entry.contentRect.height;
      }
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    containerW = rect.width;
    containerH = rect.height;
    return {
      destroy() {
        ro.disconnect();
      },
    };
  }

  function canFitLabel(r: Rect): boolean {
    return r.w > 40 && r.h > 24;
  }

  function canFitValue(r: Rect): boolean {
    return r.w > 40 && r.h > 38;
  }
</script>

<div
  class="cy-treemap"
  style="width: {width}; height: {height};"
  use:measureContainer
>
  <svg
    viewBox="0 0 {containerW} {containerH}"
    class="cy-treemap__svg"
    preserveAspectRatio="none"
    role="img"
    aria-label="Tree map"
  >
    {#each rects as rect, i}
      <rect
        x={rect.x + 1}
        y={rect.y + 1}
        width={Math.max(0, rect.w - 2)}
        height={Math.max(0, rect.h - 2)}
        fill={rect.color}
        rx="2"
        class="cy-treemap__rect"
        opacity={hoveredRect && hoveredRect !== rect ? 0.5 : 0.8}
        onmouseenter={(e) => onRectMouseMove(e, rect)}
        onmousemove={(e) => onRectMouseMove(e, rect)}
        onmouseleave={onRectMouseLeave}
      />
      {#if showLabels && canFitLabel(rect)}
        <text
          x={rect.x + rect.w / 2}
          y={rect.y + rect.h / 2 - (showValues && canFitValue(rect) ? 6 : 0)}
          class="cy-treemap__label"
          text-anchor="middle"
          dominant-baseline="central"
          pointer-events="none"
        >{rect.node.label}</text>
      {/if}
      {#if showValues && canFitValue(rect)}
        <text
          x={rect.x + rect.w / 2}
          y={rect.y + rect.h / 2 + 10}
          class="cy-treemap__value"
          text-anchor="middle"
          dominant-baseline="central"
          pointer-events="none"
        >{rect.node.value}</text>
      {/if}
    {/each}
  </svg>

  {#if hoveredRect}
    <div class="cy-treemap__tooltip" style="left: {tooltipPos.x}px; top: {tooltipPos.y}px;">
      <span class="cy-treemap__tooltip-label">{hoveredRect.node.label}</span>
      <span class="cy-treemap__tooltip-value">{hoveredRect.node.value}</span>
      <span class="cy-treemap__tooltip-pct">{percentage(hoveredRect.node.value)}</span>
    </div>
  {/if}
</div>

<style>
  .cy-treemap {
    position: relative;
    font-family: var(--font-body);
    overflow: hidden;
  }

  .cy-treemap__svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .cy-treemap__rect {
    transition: opacity 150ms ease;
    cursor: pointer;
    stroke: var(--color-surface-default);
    stroke-width: 1;
  }

  .cy-treemap__label {
    font-size: 11px;
    fill: var(--color-text-primary);
    font-family: var(--font-body);
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  }

  .cy-treemap__value {
    font-size: 9px;
    fill: var(--color-text-secondary);
    font-family: var(--font-mono);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  }

  .cy-treemap__tooltip {
    position: absolute;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    font-size: 0.75rem;
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .cy-treemap__tooltip-label {
    color: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-treemap__tooltip-value {
    color: var(--color-text-primary);
    font-family: var(--font-mono);
  }

  .cy-treemap__tooltip-pct {
    color: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }
</style>
