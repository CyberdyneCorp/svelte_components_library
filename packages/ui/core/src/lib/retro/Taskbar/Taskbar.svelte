<svelte:options runes={true} />

<script lang="ts">
  import type { TaskbarItem } from "./types.js";

  let {
    items = [],
    onItemClick,
    position = "bottom",
    ariaLabel = "Open windows",
  }: {
    items: TaskbarItem[];
    onItemClick?: (id: string) => void;
    position?: "top" | "bottom";
    ariaLabel?: string;
  } = $props();
</script>

<div class="cy-taskbar cy-taskbar--{position}" role="toolbar" aria-label={ariaLabel}>
  {#if items.length === 0}
    <span class="cy-taskbar__empty" aria-live="polite">No open windows</span>
  {:else}
    {#each items as item (item.id)}
      <button
        class="cy-taskbar__item"
        class:cy-taskbar__item--active={item.active}
        class:cy-taskbar__item--minimized={item.minimized}
        aria-pressed={item.active ?? false}
        onclick={() => onItemClick?.(item.id)}
      >
        {#if item.icon}<span class="cy-taskbar__icon" aria-hidden="true">{item.icon}</span>{/if}
        <span class="cy-taskbar__label">{item.label}</span>
      </button>
    {/each}
  {/if}
</div>

<style>
  .cy-taskbar {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 4px 8px;
    background: var(--color-surface-raised, #f5f5fa);
    border: 2px solid var(--color-text-primary, #12121a);
    font-family: var(--font-body, monospace);
    overflow-x: auto;
  }
  .cy-taskbar--bottom { border-top-width: 2px; }
  .cy-taskbar--top { border-bottom-width: 2px; }
  .cy-taskbar__empty {
    color: var(--color-text-tertiary, #6a6a7e);
    font-size: 0.8rem;
    padding: 4px 8px;
  }
  .cy-taskbar__item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    max-width: 180px;
    background: var(--color-surface-default, #fff);
    border: 2px solid var(--color-text-primary, #12121a);
    color: var(--color-text-primary, #12121a);
    font: inherit;
    font-size: 0.8rem;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cy-taskbar__item:hover { background: var(--color-surface-hover, #ebebf0); }
  .cy-taskbar__item--active {
    background: var(--color-action-brand-default, #00b32d);
    color: var(--color-action-brand-text, #fff);
  }
  .cy-taskbar__item--minimized { opacity: 0.6; }
  .cy-taskbar__label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
