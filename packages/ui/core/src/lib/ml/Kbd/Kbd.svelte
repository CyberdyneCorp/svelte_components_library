<svelte:options runes={true} />

<script lang="ts">
  let {
    keys = [],
    size = "md",
    separator = "+",
  }: {
    keys?: string[];
    size?: "sm" | "md";
    separator?: string;
  } = $props();
</script>

<span class="cy-kbd cy-kbd--{size}">
  {#each keys as key, i}
    {#if i > 0}
      <span class="cy-kbd__sep">{separator}</span>
    {/if}
    <kbd class="cy-kbd__key">{key}</kbd>
  {/each}
</span>

<style>
  .cy-kbd {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
  }

  .cy-kbd__key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border-default);
    border-bottom-width: 3px;
    border-bottom-color: var(--color-border-subtle);
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
    font-family: inherit;
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    box-shadow: var(--shadow-sm);
    user-select: none;
  }

  .cy-kbd--sm .cy-kbd__key {
    padding: 1px 6px;
    font-size: 0.6875rem;
    min-width: 20px;
    min-height: 20px;
  }

  .cy-kbd--md .cy-kbd__key {
    padding: 2px 8px;
    font-size: 0.75rem;
    min-width: 26px;
    min-height: 26px;
  }

  .cy-kbd__sep {
    color: var(--color-text-tertiary);
    font-size: 0.6875rem;
  }
</style>
