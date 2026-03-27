<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    selected = false,
    disabled = false,
    onclick,
    children,
  }: {
    selected?: boolean;
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  } = $props();
</script>

<button
  class="cy-chip"
  class:cy-chip--selected={selected}
  {disabled}
  aria-pressed={selected}
  {onclick}
  type="button"
>
  {#if children}
    {@render children()}
  {/if}
</button>

<style>
  .cy-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    height: 32px;
    background: var(--color-surface-default);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-pill);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: all var(--transition-default);
    outline: none;
    white-space: nowrap;
  }

  .cy-chip:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-chip:hover:not(:disabled) {
    background: var(--color-surface-hover);
    border-color: var(--color-border-strong);
    color: var(--color-text-primary);
  }

  .cy-chip:active:not(:disabled) {
    background: var(--color-surface-active);
  }

  .cy-chip:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-chip--selected {
    background: rgba(0, 255, 65, 0.08);
    color: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.15);
  }

  .cy-chip--selected:hover:not(:disabled) {
    background: rgba(0, 255, 65, 0.14);
    border-color: var(--color-action-brand-hover);
    color: var(--color-action-brand-hover);
    box-shadow: 0 0 14px rgba(0, 255, 65, 0.25);
  }
</style>
