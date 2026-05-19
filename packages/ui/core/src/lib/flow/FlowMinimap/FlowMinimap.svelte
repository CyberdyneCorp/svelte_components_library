<svelte:options runes={true} />

<script lang="ts">
  import type { FlowNodeSpec, Viewport } from "../types.js";
  import { NODE_DEFAULT_WIDTH } from "../types.js";

  let {
    nodes = [],
    viewport,
    width = 196,
    height = 124,
    label = "overview",
    nodeHeight = 80,
    onclose,
    onpanto,
  }: {
    nodes: FlowNodeSpec[];
    viewport?: Viewport;
    width?: number;
    height?: number;
    label?: string;
    nodeHeight?: number;
    onclose?: () => void;
    onpanto?: (worldX: number, worldY: number) => void;
  } = $props();

  const layout = $derived.by(() => {
    if (nodes.length === 0) return null;
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs) - 40;
    const maxX = Math.max(...xs) + NODE_DEFAULT_WIDTH + 40;
    const minY = Math.min(...ys) - 40;
    const maxY = Math.max(...ys) + nodeHeight + 80;
    const scale = Math.min(width / (maxX - minX), height / (maxY - minY));
    return { minX, minY, maxX, maxY, scale };
  });

  function onClickMap(e: MouseEvent) {
    if (!layout || !onpanto) return;
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    onpanto(layout.minX + localX / layout.scale, layout.minY + localY / layout.scale);
  }
</script>

{#if layout}
  <div class="cy-flow-minimap" style:width="{width}px">
    <span class="cy-flow-minimap__label">{label}</span>
    {#if onclose}
      <button class="cy-flow-minimap__close" onclick={onclose} title="Hide overview">×</button>
    {/if}
    <svg
      viewBox="0 0 {width} {height}"
      width={width}
      height={height}
      role="button"
      tabindex="-1"
      aria-label="Graph overview, click to pan"
      onclick={onClickMap}
      onkeydown={(e) => e.key === "Enter" && onClickMap(e as unknown as MouseEvent)}
    >
      {#each nodes as n (n.id)}
        <rect
          x={(n.x - layout.minX) * layout.scale}
          y={(n.y - layout.minY) * layout.scale}
          width={(n.w ?? NODE_DEFAULT_WIDTH) * layout.scale}
          height={nodeHeight * layout.scale}
          fill={n.color ?? "var(--color-text-tertiary)"}
          opacity="0.6"
          rx="1"
        ></rect>
      {/each}
    </svg>
  </div>
{/if}

<style>
  .cy-flow-minimap {
    position: relative;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    padding: var(--space-2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .cy-flow-minimap__label {
    position: absolute;
    top: 4px;
    left: 8px;
    font-family: var(--font-mono);
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-text-tertiary);
  }

  .cy-flow-minimap__close {
    position: absolute;
    top: 2px;
    right: 4px;
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--color-text-tertiary);
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    border-radius: var(--radius-xs);
  }

  .cy-flow-minimap__close:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-flow-minimap svg {
    display: block;
    margin-top: 14px;
    cursor: pointer;
  }
</style>
