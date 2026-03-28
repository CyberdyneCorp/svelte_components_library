<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    variant = "note",
    title = "",
    children,
  }: {
    variant?: "info" | "warning" | "tip" | "note";
    title?: string;
    children?: Snippet;
  } = $props();
</script>

<aside class="cy-sticky-note cy-sticky-note--{variant}" role="note">
  {#if title}
    <div class="cy-sticky-note__header">
      <span class="cy-sticky-note__icon">
        {#if variant === "info"}ℹ{:else if variant === "warning"}⚠{:else if variant === "tip"}💡{:else}📝{/if}
      </span>
      <strong class="cy-sticky-note__title">{title}</strong>
    </div>
  {/if}
  {#if children}
    <div class="cy-sticky-note__content">
      {@render children()}
    </div>
  {/if}
</aside>

<style>
  .cy-sticky-note {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    border-left: 3px solid;
  }

  .cy-sticky-note--info {
    border-left-color: var(--color-action-secondary-default);
    background: var(--color-state-info-bg);
  }

  .cy-sticky-note--warning {
    border-left-color: var(--color-state-warning);
    background: var(--color-state-warning-bg);
  }

  .cy-sticky-note--tip {
    border-left-color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
  }

  .cy-sticky-note--note {
    border-left-color: var(--color-action-tertiary-default);
    background: var(--color-state-info-bg);
  }

  .cy-sticky-note__header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .cy-sticky-note__icon {
    font-size: 0.875rem;
  }

  .cy-sticky-note__title {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .cy-sticky-note__content {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }
</style>
