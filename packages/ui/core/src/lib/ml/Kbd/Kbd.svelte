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
    gap: var(--space-1, 4px);
    font-family: var(--font-mono, "JetBrains Mono", monospace);
  }

  .cy-kbd__key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-elevated, #12121a);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-bottom-width: 3px;
    border-bottom-color: rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-sm, 6px);
    color: var(--color-text-default, rgba(255, 255, 255, 0.87));
    font-family: inherit;
    font-weight: var(--font-weight-medium, 500);
    white-space: nowrap;
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.3));
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
    color: var(--color-text-muted, rgba(255, 255, 255, 0.35));
    font-size: 0.6875rem;
  }
</style>
