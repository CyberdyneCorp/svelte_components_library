<svelte:options runes={true} />

<script lang="ts">
  import type { StartMenuItem } from "./types.js";

  let {
    label = "Start",
    items = [],
    open = $bindable(false),
    header = "Menu",
    onItemSelect,
  }: {
    label?: string;
    items: StartMenuItem[];
    open?: boolean;
    header?: string;
    onItemSelect?: (id: string) => void;
  } = $props();

  function toggle() {
    open = !open;
  }

  function select(item: StartMenuItem) {
    if (item.disabled) return;
    item.onSelect?.();
    onItemSelect?.(item.id);
    open = false;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && open) open = false;
  }

  function onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest(".cy-start")) open = false;
  }

  $effect(() => {
    if (open) {
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKeydown);
      return () => {
        document.removeEventListener("click", onDocClick);
        document.removeEventListener("keydown", onKeydown);
      };
    }
  });
</script>

<div class="cy-start">
  <button
    class="cy-start__btn"
    class:cy-start__btn--open={open}
    aria-haspopup="menu"
    aria-expanded={open}
    onclick={toggle}
  >
    <span class="cy-start__label">{label}</span>
    <span class="cy-start__arrow" aria-hidden="true">{open ? "▼" : "▶"}</span>
  </button>

  {#if open}
    <div class="cy-start__menu" role="menu" aria-label={header}>
      <div class="cy-start__header">{header}</div>
      {#each items as item (item.id)}
        <button
          class="cy-start__item"
          class:cy-start__item--disabled={item.disabled}
          role="menuitem"
          disabled={item.disabled}
          onclick={() => select(item)}
        >
          {#if item.icon}<span class="cy-start__icon" aria-hidden="true">{item.icon}</span>{/if}
          <span>{item.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cy-start {
    position: relative;
    display: inline-block;
    font-family: var(--font-body, monospace);
  }
  .cy-start__btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    background: var(--color-surface-default, #fff);
    border: 2px solid var(--color-text-primary, #12121a);
    color: var(--color-text-primary, #12121a);
    font-weight: 600;
    cursor: pointer;
  }
  .cy-start__btn:hover,
  .cy-start__btn--open {
    background: var(--color-surface-hover, #ebebf0);
  }
  .cy-start__menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    min-width: 220px;
    background: var(--color-surface-default, #fff);
    border: 2px solid var(--color-text-primary, #12121a);
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
    z-index: 200;
  }
  .cy-start__header {
    padding: 10px 12px;
    background: var(--color-action-tertiary-default, #7e22ce);
    color: var(--color-text-inverse, #fff);
    font-weight: 700;
    border-bottom: 2px solid var(--color-text-primary, #12121a);
  }
  .cy-start__item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: 0;
    text-align: left;
    cursor: pointer;
    color: var(--color-text-primary, #12121a);
    font: inherit;
  }
  .cy-start__item:hover:not(:disabled) {
    background: var(--color-surface-hover, #ebebf0);
  }
  .cy-start__item--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .cy-start__icon { font-size: 1.1em; }
</style>
