<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    color = "#3b3be0",
    gridSize = 40,
    showGrid = true,
    showScanlines = false,
    fullScreen = true,
    children,
  }: {
    color?: string;
    gridSize?: number;
    showGrid?: boolean;
    showScanlines?: boolean;
    fullScreen?: boolean;
    children?: Snippet;
  } = $props();
</script>

<div
  class="cy-crtbg"
  class:cy-crtbg--full={fullScreen}
  class:cy-crtbg--grid={showGrid}
  class:cy-crtbg--scan={showScanlines}
  style:--cy-crtbg-color={color}
  style:--cy-crtbg-cell="{gridSize}px"
  data-testid="cy-crtbg"
>
  {#if children}{@render children()}{/if}
</div>

<style>
  .cy-crtbg {
    position: relative;
    background: var(--cy-crtbg-color, #3b3be0);
    overflow: hidden;
  }
  .cy-crtbg--full { min-height: 100vh; width: 100%; }
  .cy-crtbg--grid::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
    background-size: var(--cy-crtbg-cell, 40px) var(--cy-crtbg-cell, 40px);
    pointer-events: none;
  }
  .cy-crtbg--scan::after {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.15) 0 2px,
      transparent 2px 4px
    );
    pointer-events: none;
    mix-blend-mode: multiply;
  }
</style>
