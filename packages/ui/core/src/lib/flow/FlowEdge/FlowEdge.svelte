<svelte:options runes={true} />

<script lang="ts">
  import { edgePath } from "../geometry.js";

  let {
    from = { x: 0, y: 0 },
    to = { x: 0, y: 0 },
    color = "var(--color-text-secondary)",
    selected = false,
    firing = false,
    interactive = false,
    preview = false,
    onclick,
  }: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    color?: string;
    selected?: boolean;
    firing?: boolean;
    interactive?: boolean;
    preview?: boolean;
    onclick?: (e: MouseEvent) => void;
  } = $props();

  const d = $derived(
    from && to ? edgePath(from.x, from.y, to.x, to.y) : "",
  );
</script>

{#if interactive}
  <path
    class="cy-flow-edge__hit"
    {d}
    onclick={onclick}
    onkeydown={(e) => (e.key === "Enter" || e.key === "Backspace" || e.key === "Delete") && onclick?.(e as unknown as MouseEvent)}
    role="button"
    tabindex="-1"
    aria-label="Connection"
  ></path>
{/if}
<path
  class="cy-flow-edge"
  class:cy-flow-edge--firing={firing}
  class:cy-flow-edge--selected={selected}
  class:cy-flow-edge--preview={preview}
  {d}
  stroke={color}
  fill="none"
></path>

<style>
  .cy-flow-edge {
    stroke-width: 2px;
    fill: none;
    opacity: 0.55;
    transition: opacity var(--transition-default);
    pointer-events: none;
  }

  .cy-flow-edge--selected {
    opacity: 1;
    stroke-width: 2.5px;
  }

  .cy-flow-edge--firing {
    opacity: 1;
    stroke-width: 2.5px;
    stroke-dasharray: 6 6;
    animation: cy-flow-edge-flow 0.6s linear infinite;
  }

  .cy-flow-edge--preview {
    opacity: 0.8;
    stroke-dasharray: 4 4;
  }

  .cy-flow-edge__hit {
    stroke: transparent;
    stroke-width: 14px;
    fill: none;
    cursor: pointer;
    pointer-events: stroke;
  }

  .cy-flow-edge__hit:hover + .cy-flow-edge {
    opacity: 1;
    stroke-width: 3px;
  }

  @keyframes cy-flow-edge-flow {
    to {
      stroke-dashoffset: -12;
    }
  }
</style>
