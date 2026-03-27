<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    columns = 3,
    gap = "var(--space-4, 16px)",
    minChildWidth = "280px",
    children,
  }: {
    columns?: number;
    gap?: string;
    minChildWidth?: string;
    children: Snippet;
  } = $props();

  let gridTemplate = $derived(
    columns
      ? `repeat(${columns}, 1fr)`
      : `repeat(auto-fill, minmax(${minChildWidth}, 1fr))`
  );
</script>

<div
  class="cy-grid-layout"
  style="--grid-template: {gridTemplate}; --grid-gap: {gap}"
>
  {@render children()}
</div>

<style>
  .cy-grid-layout {
    display: grid;
    grid-template-columns: var(--grid-template);
    gap: var(--grid-gap);
    width: 100%;
  }
</style>
