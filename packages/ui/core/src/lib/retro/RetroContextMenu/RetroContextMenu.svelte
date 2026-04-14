<svelte:options runes={true} />

<script lang="ts">
  import type { RetroContextMenuItem } from "./types.js";

  let {
    items = [],
    open = $bindable(false),
    x = $bindable(0),
    y = $bindable(0),
    onItemSelect,
    onClose,
  }: {
    items: RetroContextMenuItem[];
    open?: boolean;
    x?: number;
    y?: number;
    onItemSelect?: (id: string) => void;
    onClose?: () => void;
  } = $props();

  function close() { open = false; onClose?.(); }

  function select(it: RetroContextMenuItem) {
    if (it.disabled || it.separator) return;
    it.onSelect?.();
    onItemSelect?.(it.id);
    close();
  }

  function onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest(".cy-rctx")) close();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape" && open) close();
  }

  $effect(() => {
    if (open) {
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("click", onDocClick);
        document.removeEventListener("keydown", onKey);
      };
    }
  });
</script>

{#if open}
  <div
    class="cy-rctx"
    role="menu"
    style:left="{x}px"
    style:top="{y}px"
    tabindex="-1"
  >
    {#each items as it (it.id)}
      {#if it.separator}
        <div class="cy-rctx__sep" role="separator"></div>
      {:else}
        <button
          type="button"
          class="cy-rctx__item"
          class:cy-rctx__item--disabled={it.disabled}
          role="menuitem"
          disabled={it.disabled}
          onclick={() => select(it)}
        >
          {#if it.icon}<span class="cy-rctx__icon" aria-hidden="true">{it.icon}</span>{/if}
          <span class="cy-rctx__label">{it.label}</span>
          {#if it.shortcut}<span class="cy-rctx__shortcut">{it.shortcut}</span>{/if}
        </button>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .cy-rctx { position: fixed; min-width: 180px; background: var(--color-surface-default, #fff); border: 2px solid var(--color-text-primary, #12121a); box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.4); font-family: var(--font-body, monospace); font-size: 0.8rem; color: var(--color-text-primary, #12121a); z-index: 500; padding: 2px 0; }
  .cy-rctx__item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 4px 10px; background: transparent; border: 0; text-align: left; cursor: pointer; font: inherit; color: inherit; }
  .cy-rctx__item:hover:not(:disabled) { background: var(--color-surface-hover, #ebebf0); }
  .cy-rctx__item--disabled { opacity: 0.5; cursor: not-allowed; }
  .cy-rctx__icon { width: 16px; text-align: center; }
  .cy-rctx__label { flex: 1; }
  .cy-rctx__shortcut { color: var(--color-text-tertiary, #6a6a7e); font-size: 0.7rem; }
  .cy-rctx__sep { height: 1px; background: var(--color-border-default, #d0d0da); margin: 3px 4px; }
</style>
