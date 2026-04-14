<svelte:options runes={true} />

<script lang="ts">
  import type { PixelTabItem } from "./types.js";

  let {
    items = [],
    value = $bindable(""),
    onChange,
    ariaLabel = "Tabs",
  }: {
    items: PixelTabItem[];
    value?: string;
    onChange?: (id: string) => void;
    ariaLabel?: string;
  } = $props();

  function select(it: PixelTabItem) {
    if (it.disabled) return;
    value = it.id;
    onChange?.(it.id);
  }

  function onKey(e: KeyboardEvent, idx: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      for (let i = 1; i <= items.length; i++) {
        const next = items[(idx + dir * i + items.length) % items.length];
        if (!next.disabled) { select(next); break; }
      }
    }
  }
</script>

<div class="cy-ptabs" role="tablist" aria-label={ariaLabel}>
  {#each items as it, idx (it.id)}
    <button
      type="button"
      class="cy-ptabs__tab"
      class:cy-ptabs__tab--active={value === it.id}
      role="tab"
      aria-selected={value === it.id}
      tabindex={value === it.id ? 0 : -1}
      disabled={it.disabled}
      onclick={() => select(it)}
      onkeydown={(e) => onKey(e, idx)}
    >
      {#if it.icon}<span aria-hidden="true">{it.icon}</span>{/if}
      <span>{it.label}</span>
    </button>
  {/each}
</div>

<style>
  .cy-ptabs { display: flex; gap: 0; border-bottom: 2px solid var(--color-text-primary, #12121a); font-family: var(--font-body, monospace); }
  .cy-ptabs__tab { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--color-surface-raised, #f5f5fa); border: 2px solid var(--color-text-primary, #12121a); border-bottom: 0; margin-right: 2px; margin-bottom: -2px; cursor: pointer; font: inherit; font-size: 0.8rem; color: var(--color-text-secondary, #4a4a5c); }
  .cy-ptabs__tab:disabled { opacity: 0.5; cursor: not-allowed; }
  .cy-ptabs__tab--active { background: var(--color-surface-default, #fff); color: var(--color-text-primary, #12121a); font-weight: 700; }
</style>
