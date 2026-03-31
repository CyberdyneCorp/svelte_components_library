<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  type SortableItem = { id: string; [key: string]: any };

  let {
    items = $bindable([]),
    renderItem,
    onreorder,
    disabled = false,
    handle = true,
  }: {
    items?: SortableItem[];
    renderItem?: Snippet<[{ item: SortableItem; index: number; dragHandle: Snippet }]>;
    onreorder?: (items: SortableItem[]) => void;
    disabled?: boolean;
    handle?: boolean;
  } = $props();

  let dragIndex = $state<number | null>(null);
  let overIndex = $state<number | null>(null);
  let keyboardActiveIndex = $state<number | null>(null);
  let keyboardMoving = $state(false);

  function handleDragStart(event: DragEvent, index: number) {
    if (disabled) return;
    dragIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    }
  }

  function handleDragOver(event: DragEvent, index: number) {
    if (disabled || dragIndex === null) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    overIndex = index;
  }

  function handleDragLeave() {
    overIndex = null;
  }

  function handleDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    if (disabled || dragIndex === null || dragIndex === targetIndex) {
      dragIndex = null;
      overIndex = null;
      return;
    }
    reorder(dragIndex, targetIndex);
    dragIndex = null;
    overIndex = null;
  }

  function handleDragEnd() {
    dragIndex = null;
    overIndex = null;
  }

  function reorder(fromIndex: number, toIndex: number) {
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    items = updated;
    onreorder?.(updated);
  }

  function handleItemKeydown(event: KeyboardEvent, index: number) {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (keyboardMoving && keyboardActiveIndex !== null) {
        // Drop the item
        if (keyboardActiveIndex !== index) {
          reorder(keyboardActiveIndex, index);
        }
        keyboardMoving = false;
        keyboardActiveIndex = null;
      } else {
        // Pick up the item
        keyboardActiveIndex = index;
        keyboardMoving = true;
      }
    } else if (event.key === "Escape" && keyboardMoving) {
      event.preventDefault();
      keyboardMoving = false;
      keyboardActiveIndex = null;
    } else if (keyboardMoving && keyboardActiveIndex !== null) {
      if (event.key === "ArrowUp" && keyboardActiveIndex > 0) {
        event.preventDefault();
        reorder(keyboardActiveIndex, keyboardActiveIndex - 1);
        keyboardActiveIndex = keyboardActiveIndex - 1;
      } else if (event.key === "ArrowDown" && keyboardActiveIndex < items.length - 1) {
        event.preventDefault();
        reorder(keyboardActiveIndex, keyboardActiveIndex + 1);
        keyboardActiveIndex = keyboardActiveIndex + 1;
      }
    }
  }
</script>

{#snippet dragHandleSnippet()}
  {#if handle && !disabled}
    <span class="cy-sortable-list__handle" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="5" cy="3" r="1.2" fill="currentColor" />
        <circle cx="11" cy="3" r="1.2" fill="currentColor" />
        <circle cx="5" cy="8" r="1.2" fill="currentColor" />
        <circle cx="11" cy="8" r="1.2" fill="currentColor" />
        <circle cx="5" cy="13" r="1.2" fill="currentColor" />
        <circle cx="11" cy="13" r="1.2" fill="currentColor" />
      </svg>
    </span>
  {/if}
{/snippet}

<div
  class="cy-sortable-list"
  class:cy-sortable-list--disabled={disabled}
  role="listbox"
  aria-label="Sortable list"
>
  {#each items as item, index (item.id)}
    {@const isDragging = dragIndex === index}
    {@const isOver = overIndex === index && dragIndex !== index}
    {@const isKeyboardActive = keyboardActiveIndex === index && keyboardMoving}

    <div
      class="cy-sortable-list__item"
      class:cy-sortable-list__item--dragging={isDragging}
      class:cy-sortable-list__item--over={isOver}
      class:cy-sortable-list__item--keyboard-active={isKeyboardActive}
      draggable={!disabled && handle}
      role="option"
      aria-selected={isKeyboardActive}
      aria-grabbed={isDragging || isKeyboardActive}
      tabindex={disabled ? -1 : 0}
      ondragstart={(e) => handleDragStart(e, index)}
      ondragover={(e) => handleDragOver(e, index)}
      ondragleave={handleDragLeave}
      ondrop={(e) => handleDrop(e, index)}
      ondragend={handleDragEnd}
      onkeydown={(e) => handleItemKeydown(e, index)}
    >
      {#if isOver}
        <div class="cy-sortable-list__indicator"></div>
      {/if}
      {@render renderItem?.({ item, index, dragHandle: dragHandleSnippet })}
    </div>
  {/each}
</div>

<style>
  .cy-sortable-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .cy-sortable-list__item {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    transition:
      opacity var(--transition-default),
      transform var(--transition-default),
      box-shadow var(--transition-default),
      border-color var(--transition-default);
    cursor: default;
  }

  .cy-sortable-list__item:focus-visible {
    outline: 2px solid var(--color-action-brand-default);
    outline-offset: 2px;
  }

  .cy-sortable-list__item--dragging {
    opacity: 0.4;
    transform: scale(0.98);
  }

  .cy-sortable-list__item--over {
    border-color: var(--color-state-success);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-sortable-list__item--keyboard-active {
    border-color: var(--color-action-brand-default);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-sortable-list__indicator {
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--color-state-success);
    border-radius: var(--radius-pill);
  }

  .cy-sortable-list__handle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 20px;
    color: var(--color-text-muted);
    cursor: grab;
    transition: color var(--transition-default);
  }

  .cy-sortable-list__handle:hover {
    color: var(--color-text-secondary);
  }

  .cy-sortable-list__item--dragging .cy-sortable-list__handle {
    cursor: grabbing;
  }

  .cy-sortable-list--disabled .cy-sortable-list__item {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cy-sortable-list--disabled .cy-sortable-list__handle {
    display: none;
  }
</style>
