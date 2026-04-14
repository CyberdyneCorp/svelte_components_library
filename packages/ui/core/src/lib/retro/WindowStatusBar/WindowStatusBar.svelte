<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    segments = [],
    ariaLabel = "Window status",
    children,
  }: {
    segments?: string[];
    ariaLabel?: string;
    children?: Snippet;
  } = $props();
</script>

<div class="cy-winstatus" role="status" aria-label={ariaLabel}>
  {#if children}
    {@render children()}
  {:else}
    {#each segments as seg, i (i)}
      <span class="cy-winstatus__seg">{seg}</span>
    {/each}
  {/if}
</div>

<style>
  .cy-winstatus {
    display: flex;
    align-items: center;
    gap: 0;
    background: var(--color-surface-raised, #f5f5fa);
    border-top: 2px solid var(--color-text-primary, #12121a);
    font-family: var(--font-body, monospace);
    font-size: 0.75rem;
    color: var(--color-text-secondary, #4a4a5c);
  }
  .cy-winstatus__seg {
    display: inline-block;
    padding: 3px 8px;
    border-right: 1px solid var(--color-border-default, #d0d0da);
    white-space: nowrap;
  }
  .cy-winstatus__seg:last-child { border-right: 0; flex: 1; }
</style>
