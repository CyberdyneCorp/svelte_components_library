<svelte:options runes={true} />

<script lang="ts">
  import ImageryLayer from "../ImageryLayer/ImageryLayer.svelte";
  import type { ImageryProviderSpec } from "../types.js";

  type BaseLayerOption = {
    id: string;
    label: string;
    provider: ImageryProviderSpec;
    /** Optional preview image URL displayed in the dropdown. */
    thumbnail?: string;
  };

  type Props = {
    options: BaseLayerOption[];
    /** Currently selected option id. Bindable. */
    selectedId?: string;
    /** Visual position inside the parent CesiumGlobe. */
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
    /** Whether to render and mount the selected `ImageryLayer` automatically. */
    autoMount?: boolean;
    onchange?: (option: BaseLayerOption) => void;
  };

  let {
    options,
    selectedId = $bindable(""),
    position = "top-right",
    autoMount = true,
    onchange,
  }: Props = $props();

  // Default to the first option if `selectedId` is empty or stale.
  $effect(() => {
    if (options.length === 0) return;
    if (!selectedId || !options.some((o) => o.id === selectedId)) {
      selectedId = options[0].id;
    }
  });

  const selected = $derived(options.find((o) => o.id === selectedId) ?? options[0]);
  let open = $state(false);

  function pick(option: BaseLayerOption): void {
    selectedId = option.id;
    open = false;
    onchange?.(option);
  }
</script>

{#if autoMount && selected}
  <ImageryLayer provider={selected.provider} />
{/if}

<div class="cy-cesium-baselayer" data-position={position}>
  <button
    type="button"
    class="cy-cesium-baselayer__trigger"
    aria-haspopup="listbox"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    {#if selected?.thumbnail}
      <img src={selected.thumbnail} alt="" class="cy-cesium-baselayer__thumb" />
    {/if}
    <span class="cy-cesium-baselayer__label">{selected?.label ?? "—"}</span>
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path d="M4 6 L8 10 L12 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>

  {#if open}
    <ul class="cy-cesium-baselayer__menu" role="listbox">
      {#each options as option (option.id)}
        <li role="presentation">
          <button
            type="button"
            class="cy-cesium-baselayer__option"
            class:cy-cesium-baselayer__option--active={option.id === selectedId}
            role="option"
            aria-selected={option.id === selectedId}
            onclick={() => pick(option)}
          >
            {#if option.thumbnail}
              <img src={option.thumbnail} alt="" class="cy-cesium-baselayer__thumb" />
            {/if}
            <span>{option.label}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .cy-cesium-baselayer {
    position: absolute;
    z-index: 1000;
    font-family: "Inter", system-ui, sans-serif;
  }
  .cy-cesium-baselayer[data-position="top-right"] {
    top: 12px;
    right: 12px;
  }
  .cy-cesium-baselayer[data-position="top-left"] {
    top: 12px;
    left: 12px;
  }
  .cy-cesium-baselayer[data-position="bottom-right"] {
    bottom: 12px;
    right: 12px;
  }
  .cy-cesium-baselayer[data-position="bottom-left"] {
    bottom: 12px;
    left: 12px;
  }
  .cy-cesium-baselayer__trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
    background: var(--color-surface-default, rgba(18, 18, 26, 0.85));
    color: var(--color-text-primary, #f0f0ff);
    cursor: pointer;
    font-size: 12px;
    backdrop-filter: blur(8px);
  }
  .cy-cesium-baselayer__trigger:hover {
    border-color: var(--color-action-secondary-default, #00d4ff);
  }
  .cy-cesium-baselayer__thumb {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    object-fit: cover;
  }
  .cy-cesium-baselayer__menu {
    list-style: none;
    margin: 4px 0 0;
    padding: 4px;
    border-radius: 8px;
    background: var(--color-surface-default, rgba(18, 18, 26, 0.95));
    border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
    min-width: 180px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
  }
  .cy-cesium-baselayer__option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    border: none;
    background: transparent;
    color: var(--color-text-primary, #f0f0ff);
    cursor: pointer;
    border-radius: 4px;
    font-size: 12px;
    text-align: left;
  }
  .cy-cesium-baselayer__option:hover {
    background: var(--color-action-secondary-bg, rgba(0, 212, 255, 0.12));
  }
  .cy-cesium-baselayer__option--active {
    background: var(--color-action-brand-bg, rgba(0, 255, 65, 0.12));
    color: var(--color-action-brand-default, #00ff41);
  }
</style>
