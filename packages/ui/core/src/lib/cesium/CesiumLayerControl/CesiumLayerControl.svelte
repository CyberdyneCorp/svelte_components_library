<svelte:options runes={true} />

<script lang="ts">
  type LayerControlGroup = {
    id: string;
    label: string;
    /** Initial open / collapsed state for this group. */
    defaultOpen?: boolean;
  };

  type LayerControlItem = {
    id: string;
    label: string;
    /** Optional group id; items without a group render at the top. */
    group?: string;
    visible: boolean;
    /** Optional opacity 0..1. When set, a slider is rendered alongside the toggle. */
    opacity?: number;
    /** Short status hint shown below the label (e.g. "12 km tiles", "12 selected"). */
    hint?: string;
    /** Disable both toggle and slider for this item. */
    disabled?: boolean;
  };

  type Props = {
    layers: LayerControlItem[];
    /** Optional named groups; renders an accordion-style section per group. */
    groups?: LayerControlGroup[];
    /** Panel title rendered at the top. */
    title?: string;
    onchange?: (
      id: string,
      patch: { visible?: boolean; opacity?: number },
    ) => void;
    /** Visual position inside the parent CesiumGlobe. */
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "embed";
  };

  let {
    layers,
    groups = [],
    title = "Layers",
    onchange,
    position = "top-right",
  }: Props = $props();

  // Track per-group open state internally so consumers don't need to pipe it
  // through their own state. A plain record keeps reactivity simple and
  // avoids a long-lived mutable Set.
  let openState = $state<Record<string, boolean>>({});
  $effect(() => {
    const next: Record<string, boolean> = {};
    for (const g of groups) {
      next[g.id] = openState[g.id] ?? (g.defaultOpen ?? true);
    }
    openState = next;
  });

  function isOpen(id: string): boolean {
    return openState[id] ?? true;
  }

  function toggleGroup(id: string): void {
    openState = { ...openState, [id]: !isOpen(id) };
  }

  const ungrouped = $derived(layers.filter((l) => !l.group));
  function itemsForGroup(id: string): LayerControlItem[] {
    return layers.filter((l) => l.group === id);
  }
</script>

<div class="cy-cesium-layers" data-position={position}>
  {#if title}
    <header class="cy-cesium-layers__header">{title}</header>
  {/if}

  {#if ungrouped.length > 0}
    <ul class="cy-cesium-layers__list">
      {#each ungrouped as item (item.id)}
        {@render row(item)}
      {/each}
    </ul>
  {/if}

  {#each groups as group (group.id)}
    {@const items = itemsForGroup(group.id)}
    {#if items.length > 0}
      <section class="cy-cesium-layers__group">
        <button
          type="button"
          class="cy-cesium-layers__group-head"
          aria-expanded={isOpen(group.id)}
          onclick={() => toggleGroup(group.id)}
        >
          <span class="cy-cesium-layers__chevron" data-open={isOpen(group.id)}>▸</span>
          <span>{group.label}</span>
          <span class="cy-cesium-layers__group-count">{items.length}</span>
        </button>
        {#if isOpen(group.id)}
          <ul class="cy-cesium-layers__list">
            {#each items as item (item.id)}
              {@render row(item)}
            {/each}
          </ul>
        {/if}
      </section>
    {/if}
  {/each}
</div>

{#snippet row(item: LayerControlItem)}
  <li class="cy-cesium-layers__item" class:cy-cesium-layers__item--off={!item.visible} class:cy-cesium-layers__item--disabled={item.disabled}>
    <label class="cy-cesium-layers__toggle">
      <input
        type="checkbox"
        checked={item.visible}
        disabled={item.disabled}
        onchange={(e) =>
          onchange?.(item.id, {
            visible: (e.currentTarget as HTMLInputElement).checked,
          })}
      />
      <span class="cy-cesium-layers__pill"></span>
      <span class="cy-cesium-layers__label">
        {item.label}
        {#if item.hint}
          <span class="cy-cesium-layers__hint">{item.hint}</span>
        {/if}
      </span>
    </label>
    {#if typeof item.opacity === "number"}
      <input
        type="range"
        class="cy-cesium-layers__slider"
        min={0}
        max={1}
        step={0.01}
        value={item.opacity}
        disabled={item.disabled || !item.visible}
        aria-label="{item.label} opacity"
        oninput={(e) =>
          onchange?.(item.id, {
            opacity: Number((e.currentTarget as HTMLInputElement).value),
          })}
      />
    {/if}
  </li>
{/snippet}

<style>
  .cy-cesium-layers {
    z-index: 1000;
    width: 240px;
    padding: 8px;
    border-radius: 10px;
    background: var(--color-surface-default, rgba(18, 18, 26, 0.9));
    border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
    color: var(--color-text-primary, #f0f0ff);
    backdrop-filter: blur(8px);
    font-family: "Inter", system-ui, sans-serif;
  }
  .cy-cesium-layers[data-position="top-right"] {
    position: absolute;
    top: 12px;
    right: 12px;
  }
  .cy-cesium-layers[data-position="top-left"] {
    position: absolute;
    top: 12px;
    left: 12px;
  }
  .cy-cesium-layers[data-position="bottom-right"] {
    position: absolute;
    bottom: 12px;
    right: 12px;
  }
  .cy-cesium-layers[data-position="bottom-left"] {
    position: absolute;
    bottom: 12px;
    left: 12px;
  }
  .cy-cesium-layers__header {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-tertiary, #94a3b8);
    padding: 4px 8px 6px;
  }
  .cy-cesium-layers__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .cy-cesium-layers__item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 8px;
    border-radius: 6px;
  }
  .cy-cesium-layers__item:hover {
    background: var(--color-action-secondary-bg, rgba(0, 212, 255, 0.06));
  }
  .cy-cesium-layers__item--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  .cy-cesium-layers__toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .cy-cesium-layers__toggle input {
    appearance: none;
    width: 28px;
    height: 16px;
    border-radius: 999px;
    background: var(--color-bg-secondary, rgba(255, 255, 255, 0.12));
    position: relative;
    transition: background 0.15s ease;
    cursor: pointer;
    flex-shrink: 0;
  }
  .cy-cesium-layers__toggle input::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--color-text-primary, #f0f0ff);
    transition: transform 0.15s ease;
  }
  .cy-cesium-layers__toggle input:checked {
    background: var(--color-action-brand-default, #00ff41);
  }
  .cy-cesium-layers__toggle input:checked::before {
    transform: translateX(12px);
  }
  .cy-cesium-layers__pill {
    display: none;
  }
  .cy-cesium-layers__label {
    flex: 1;
    font-size: 13px;
    color: var(--color-text-primary, #f0f0ff);
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .cy-cesium-layers__item--off .cy-cesium-layers__label {
    color: var(--color-text-tertiary, #94a3b8);
  }
  .cy-cesium-layers__hint {
    font-size: 10px;
    color: var(--color-text-tertiary, #94a3b8);
    font-family: "JetBrains Mono", monospace;
  }
  .cy-cesium-layers__slider {
    width: 100%;
    accent-color: var(--color-action-secondary-default, #00d4ff);
  }
  .cy-cesium-layers__group {
    margin-top: 4px;
    border-top: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.06));
    padding-top: 4px;
  }
  .cy-cesium-layers__group-head {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 6px 8px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--color-text-secondary, #cbd5f5);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
  }
  .cy-cesium-layers__group-head:hover {
    background: var(--color-action-secondary-bg, rgba(0, 212, 255, 0.06));
  }
  .cy-cesium-layers__chevron {
    display: inline-block;
    width: 10px;
    transition: transform 0.15s ease;
  }
  .cy-cesium-layers__chevron[data-open="true"] {
    transform: rotate(90deg);
  }
  .cy-cesium-layers__group-count {
    margin-left: auto;
    color: var(--color-text-tertiary, #94a3b8);
    font-weight: 400;
  }
</style>
