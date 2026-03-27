<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    title = "",
    description = "",
    icon = "terminal",
    children,
  }: {
    title?: string;
    description?: string;
    icon?: string;
    children?: Snippet;
  } = $props();

  const icons: Record<string, string> = {
    terminal: "M4 17l6-5-6-5m8 10h6",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
    data: "M4 7v10c0 2 3 4 8 4s8-2 8-4V7M4 7c0 2 3 4 8 4s8-2 8-4M4 7c0-2 3-4 8-4s8 2 8 4",
  };

  let iconPath = $derived(icons[icon] || icons.terminal);
</script>

<div class="cy-empty-state">
  <div class="cy-empty-state__icon">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d={iconPath} />
    </svg>
  </div>
  <h3 class="cy-empty-state__title">{title}</h3>
  {#if description}
    <p class="cy-empty-state__desc">{description}</p>
  {/if}
  {#if children}
    <div class="cy-empty-state__actions">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .cy-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-10) var(--space-6);
    border: 2px dashed var(--color-border-subtle);
    border-radius: var(--radius-lg);
    background: transparent;
  }

  .cy-empty-state__icon {
    color: var(--color-text-tertiary);
    margin-bottom: var(--space-4);
    opacity: 0.6;
  }

  .cy-empty-state__title {
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2) 0;
  }

  .cy-empty-state__desc {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-tertiary);
    max-width: 360px;
    line-height: 1.5;
    margin: 0;
  }

  .cy-empty-state__actions {
    margin-top: var(--space-5);
  }
</style>
