<svelte:options runes={true} />

<script lang="ts">
  export type NodePaletteItem = {
    type: string;
    label: string;
    sub: string;
    icon?: string;
  };

  export type NodePaletteGroup = {
    name: string;
    color: string;
    items: NodePaletteItem[];
  };

  let {
    groups = [],
    filter = $bindable(""),
    title = "Node library",
    placeholder = "Filter nodes…",
    hotkey = "/",
    dragMimeType = "application/x-node-type",
    width = "252px",
    ondragstart,
    onitemclick,
  }: {
    groups: NodePaletteGroup[];
    filter?: string;
    title?: string;
    placeholder?: string;
    hotkey?: string;
    dragMimeType?: string;
    width?: string;
    ondragstart?: (e: DragEvent, typeKey: string) => void;
    onitemclick?: (typeKey: string) => void;
  } = $props();

  let searchEl: HTMLInputElement | undefined = $state();

  const totalCount = $derived(
    groups.reduce((s, g) => s + g.items.length, 0),
  );

  const filteredGroups = $derived.by(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (i) =>
            i.label.toLowerCase().includes(f) ||
            i.sub.toLowerCase().includes(f) ||
            i.type.toLowerCase().includes(f),
        ),
      }))
      .filter((g) => g.items.length > 0);
  });

  $effect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isInput = active?.tagName === "INPUT" || active?.tagName === "TEXTAREA";
      if (e.key === hotkey && !isInput) {
        e.preventDefault();
        searchEl?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function onDragStart(e: DragEvent, typeKey: string) {
    if (e.dataTransfer) {
      e.dataTransfer.setData(dragMimeType, typeKey);
      e.dataTransfer.effectAllowed = "copy";
    }
    ondragstart?.(e, typeKey);
  }
</script>

<aside class="cy-node-palette" style:width>
  <div class="cy-node-palette__header">
    <span class="cy-node-palette__title">{title}</span>
    <span class="cy-node-palette__count">{totalCount}</span>
  </div>

  <div class="cy-node-palette__search">
    <span class="cy-node-palette__search-icon">⌕</span>
    <input
      bind:this={searchEl}
      class="cy-node-palette__input"
      type="text"
      {placeholder}
      bind:value={filter}
    />
    {#if hotkey}
      <span class="cy-node-palette__kbd">{hotkey}</span>
    {/if}
  </div>

  <div class="cy-node-palette__scroll">
    {#each filteredGroups as g (g.name)}
      <div class="cy-node-palette__group-head">
        <span class="cy-node-palette__group-label">{g.name}</span>
        <span class="cy-node-palette__group-line"></span>
      </div>
      {#each g.items as it (it.type)}
        <div
          class="cy-node-palette__item"
          draggable="true"
          role="button"
          tabindex="0"
          ondragstart={(e) => onDragStart(e, it.type)}
          onclick={() => onitemclick?.(it.type)}
          onkeydown={(e) => (e.key === "Enter" || e.key === " ") && onitemclick?.(it.type)}
        >
          <span class="cy-node-palette__swatch" style:background={g.color}></span>
          <span class="cy-node-palette__label">{it.label}</span>
          <span class="cy-node-palette__sub">{it.sub}</span>
        </div>
      {/each}
    {/each}
    {#if filteredGroups.length === 0}
      <div class="cy-node-palette__empty">No nodes match “{filter}”.</div>
    {/if}
  </div>
</aside>

<style>
  .cy-node-palette {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-bg-secondary);
    border-right: 1px solid var(--color-border-default);
    font-family: var(--font-body);
    color: var(--color-text-primary);
  }

  .cy-node-palette__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .cy-node-palette__title {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-tertiary);
  }

  .cy-node-palette__count {
    font-family: var(--font-mono);
    font-size: 10.5px;
    color: var(--color-text-disabled);
  }

  .cy-node-palette__search {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .cy-node-palette__search-icon {
    font-family: var(--font-mono);
    color: var(--color-text-tertiary);
    font-size: 13px;
  }

  .cy-node-palette__input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text-primary);
    font-family: var(--font-body);
    font-size: 12.5px;
  }

  .cy-node-palette__input::placeholder {
    color: var(--color-text-tertiary);
  }

  .cy-node-palette__kbd {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--color-text-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xs);
    padding: 1px 5px;
  }

  .cy-node-palette__scroll {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-2) 0;
  }

  .cy-node-palette__group-head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-3) var(--space-1);
  }

  .cy-node-palette__group-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-tertiary);
  }

  .cy-node-palette__group-line {
    flex: 1;
    height: 1px;
    background: var(--color-border-subtle);
  }

  .cy-node-palette__item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 6px var(--space-3);
    cursor: grab;
    font-size: 12.5px;
    color: var(--color-text-secondary);
    transition: background var(--transition-default);
  }

  .cy-node-palette__item:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-node-palette__item:active {
    cursor: grabbing;
  }

  .cy-node-palette__swatch {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-shadow: 0 0 6px currentColor;
    flex-shrink: 0;
  }

  .cy-node-palette__label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cy-node-palette__sub {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--color-text-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xs);
    padding: 1px 5px;
    letter-spacing: 0.04em;
  }

  .cy-node-palette__empty {
    padding: var(--space-4);
    color: var(--color-text-tertiary);
    font-size: 12px;
    text-align: center;
  }
</style>
