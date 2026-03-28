<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    items = [],
    itemHeight = 48,
    height = "400px",
    renderItem,
    overscan = 5,
  }: {
    items?: any[];
    itemHeight?: number;
    height?: string;
    renderItem: Snippet<[{ item: any; index: number }]>;
    overscan?: number;
  } = $props();

  let scrollTop = $state(0);
  let containerEl: HTMLDivElement | undefined = $state();
  let containerHeight = $state(0);

  let totalHeight = $derived(items.length * itemHeight);

  let startIndex = $derived(Math.max(0, Math.floor(scrollTop / itemHeight) - overscan));
  let endIndex = $derived(
    Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
  );

  let visibleItems = $derived(
    items.slice(startIndex, endIndex).map((item, i) => ({
      item,
      index: startIndex + i,
    }))
  );

  let offsetY = $derived(startIndex * itemHeight);

  function handleScroll(e: Event) {
    const target = e.target as HTMLDivElement;
    scrollTop = target.scrollTop;
  }

  $effect(() => {
    if (containerEl) {
      containerHeight = containerEl.clientHeight;
    }
  });
</script>

<div
  class="cy-virtualized-list"
  style="--list-height: {height}"
  bind:this={containerEl}
  onscroll={handleScroll}
>
  <div class="cy-virtualized-list__spacer" style="height: {totalHeight}px">
    <div class="cy-virtualized-list__items" style="transform: translateY({offsetY}px)">
      {#each visibleItems as { item, index } (index)}
        <div class="cy-virtualized-list__item" style="height: {itemHeight}px">
          {@render renderItem({ item, index })}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .cy-virtualized-list {
    height: var(--list-height);
    overflow-y: auto;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md, 8px);
    scrollbar-width: thin;
    scrollbar-color: var(--color-action-brand-default) transparent;
  }

  .cy-virtualized-list::-webkit-scrollbar {
    width: 6px;
  }

  .cy-virtualized-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .cy-virtualized-list::-webkit-scrollbar-thumb {
    background: var(--color-action-brand-default);
    border-radius: 3px;
  }

  .cy-virtualized-list__spacer {
    position: relative;
    width: 100%;
  }

  .cy-virtualized-list__items {
    will-change: transform;
  }

  .cy-virtualized-list__item {
    display: flex;
    align-items: center;
    padding: 0 var(--space-3, 12px);
    border-bottom: 1px solid var(--color-border-subtle);
    color: var(--color-text-primary);
    font-family: var(--font-mono, monospace);
    font-size: 0.875rem;
  }

  .cy-virtualized-list__item:hover {
    background: var(--color-state-success-bg);
  }
</style>
