<svelte:options runes={true} />

<script lang="ts">
  /** Shared table shell and styles for PositionsTable / OpenOrdersTable (internal). */
  import type { Snippet } from "svelte";

  let {
    caption,
    toolbar = undefined,
    children,
  }: {
    caption: string;
    toolbar?: Snippet;
    children: Snippet;
  } = $props();
</script>

<div class="cy-tt">
  {#if toolbar}
    <div class="cy-tt__toolbar">{@render toolbar()}</div>
  {/if}
  <div class="cy-tt__scroll">
    <table class="cy-tt__table">
      <caption class="cy-tt__caption">{caption}</caption>
      {@render children()}
    </table>
  </div>
</div>

<style>
  .cy-tt {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
    color: var(--color-text-primary);
  }

  .cy-tt__toolbar {
    display: flex;
    justify-content: flex-end;
  }

  .cy-tt__scroll {
    overflow-x: auto;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    background: var(--color-surface-default);
  }

  .cy-tt__table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-body);
    font-size: 0.8125rem;
  }

  .cy-tt__caption {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .cy-tt__table :global(th),
  .cy-tt__table :global(td) {
    padding: var(--space-2) var(--space-3);
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .cy-tt__table :global(thead th) {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
    background: var(--color-bg-secondary);
  }

  .cy-tt__table :global(tbody th) {
    font-weight: var(--font-weight-semibold);
  }

  .cy-tt__table :global(tbody tr:last-child > *) {
    border-bottom: none;
  }

  .cy-tt__table :global(.cy-tt__num) {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .cy-tt__table :global(.cy-tt__long) {
    color: var(--color-trade-long-text);
  }

  .cy-tt__table :global(.cy-tt__short) {
    color: var(--color-trade-short-text);
  }

  .cy-tt__table :global(.cy-tt__muted) {
    color: var(--color-text-secondary);
  }

  .cy-tt__table :global(.cy-tt__empty) {
    padding: var(--space-6) var(--space-3);
    text-align: center;
    color: var(--color-text-secondary);
  }

  .cy-tt__table :global(.cy-tt__actions) {
    display: flex;
    gap: var(--space-1);
    justify-content: flex-end;
  }

  .cy-tt :global(.cy-tt__button) {
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-sm);
    padding: var(--space-1) var(--space-2);
    cursor: pointer;
    white-space: nowrap;
  }

  .cy-tt :global(.cy-tt__button:hover) {
    background: var(--color-surface-hover);
  }

  .cy-tt :global(.cy-tt__button:focus-visible) {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 1px;
  }
</style>
