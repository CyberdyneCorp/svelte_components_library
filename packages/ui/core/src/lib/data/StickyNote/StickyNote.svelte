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
    border-left-color: var(--color-info, #00d4ff);
    background: rgba(0, 212, 255, 0.05);
  }

  .cy-sticky-note--warning {
    border-left-color: var(--color-warning, #f59e0b);
    background: rgba(245, 158, 11, 0.05);
  }

  .cy-sticky-note--tip {
    border-left-color: var(--color-action-brand-default, #00ff41);
    background: rgba(0, 255, 65, 0.05);
  }

  .cy-sticky-note--note {
    border-left-color: var(--color-tertiary, #a855f7);
    background: rgba(168, 85, 247, 0.05);
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
    color: var(--color-text-primary, #fff);
  }

  .cy-sticky-note__content {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    color: var(--color-text-secondary, rgba(255, 255, 255, 0.6));
    line-height: 1.5;
  }
</style>
