<svelte:options runes={true} />

<script lang="ts">
  import type { BlockType } from "./block-utils.js";

  interface SlashMenuItem {
    label: string;
    type: BlockType;
    template: string;
    icon: string;
    description: string;
  }

  const DEFAULT_MENU_ITEMS: SlashMenuItem[] = [
    { label: "Text", type: "paragraph", template: "", icon: "T", description: "Plain text paragraph" },
    { label: "Heading 1", type: "heading", template: "# ", icon: "H1", description: "Large heading" },
    { label: "Heading 2", type: "heading", template: "## ", icon: "H2", description: "Medium heading" },
    { label: "Heading 3", type: "heading", template: "### ", icon: "H3", description: "Small heading" },
    { label: "Bullet List", type: "unordered-list", template: "- ", icon: "•", description: "Unordered list" },
    { label: "Numbered List", type: "ordered-list", template: "1. ", icon: "1.", description: "Ordered list" },
    { label: "Task List", type: "task-list", template: "- [ ] ", icon: "☐", description: "Checklist with tasks" },
    { label: "Code Block", type: "code-block", template: "```\n\n```", icon: "<>", description: "Fenced code block" },
    { label: "Blockquote", type: "blockquote", template: "> ", icon: "❝", description: "Quote block" },
    { label: "Table", type: "table", template: "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |", icon: "⊞", description: "Data table" },
    { label: "Horizontal Rule", type: "horizontal-rule", template: "---", icon: "—", description: "Divider line" },
    { label: "Image", type: "image", template: "![alt](url)", icon: "🖼", description: "Embed an image" },
    { label: "Mermaid", type: "mermaid", template: "```mermaid\nflowchart TD\n    A[Start] --> B[End]\n```", icon: "◇", description: "Mermaid diagram" },
  ];

  let {
    filter = "",
    position = { top: 0, left: 0 },
    items,
    onselect,
    onclose,
  }: {
    filter?: string;
    position?: { top: number; left: number };
    items?: SlashMenuItem[];
    onselect?: (template: string, type: BlockType) => void;
    onclose?: () => void;
  } = $props();

  let menuItems = $derived(items ?? DEFAULT_MENU_ITEMS);

  let focusedIndex = $state(0);
  let menuEl: HTMLDivElement | undefined = $state();

  let filteredItems = $derived.by(() => {
    if (!filter) return menuItems;
    const q = filter.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.type.includes(q),
    );
  });

  // Reset focus when filter changes
  $effect(() => {
    void filteredItems;
    focusedIndex = 0;
  });

  function selectItem(item: SlashMenuItem) {
    onselect?.(item.template, item.type);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusedIndex = (focusedIndex + 1) % filteredItems.length;
      scrollToFocused();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusedIndex = (focusedIndex - 1 + filteredItems.length) % filteredItems.length;
      scrollToFocused();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[focusedIndex]) {
        selectItem(filteredItems[focusedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onclose?.();
    }
  }

  function scrollToFocused() {
    if (!menuEl) return;
    const focused = menuEl.querySelector(".cy-block-editor__slash-item--focused");
    focused?.scrollIntoView({ block: "nearest" });
  }

  // Close on outside click
  function handleWindowClick(e: MouseEvent) {
    if (menuEl && !menuEl.contains(e.target as Node)) {
      onclose?.();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleWindowClick} />

<div
  class="cy-block-editor__slash-menu"
  bind:this={menuEl}
  style="top: {position.top}px; left: {position.left}px"
  role="listbox"
  aria-label="Block type menu"
>
  {#if filteredItems.length === 0}
    <div class="cy-block-editor__slash-empty">No matching blocks</div>
  {:else}
    {#each filteredItems as item, i}
      <button
        type="button"
        class="cy-block-editor__slash-item"
        class:cy-block-editor__slash-item--focused={i === focusedIndex}
        role="option"
        aria-selected={i === focusedIndex}
        onclick={() => selectItem(item)}
        onmouseenter={() => (focusedIndex = i)}
      >
        <span class="cy-block-editor__slash-icon">{item.icon}</span>
        <span class="cy-block-editor__slash-content">
          <span class="cy-block-editor__slash-label">{item.label}</span>
          <span class="cy-block-editor__slash-desc">{item.description}</span>
        </span>
      </button>
    {/each}
  {/if}
</div>

<style>
  .cy-block-editor__slash-menu {
    position: absolute;
    z-index: 100;
    width: 280px;
    max-height: 320px;
    overflow-y: auto;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-subtle);
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  }

  .cy-block-editor__slash-empty {
    padding: 12px 16px;
    color: var(--color-text-tertiary);
    font-size: 0.8125rem;
    text-align: center;
  }

  .cy-block-editor__slash-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--color-text-primary);
    cursor: pointer;
    text-align: left;
    transition: background 100ms ease;
  }

  .cy-block-editor__slash-item:hover,
  .cy-block-editor__slash-item--focused {
    background: var(--color-state-success-bg);
  }

  .cy-block-editor__slash-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 0.75rem;
    color: var(--color-action-brand-default);
    flex-shrink: 0;
  }

  .cy-block-editor__slash-content {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .cy-block-editor__slash-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .cy-block-editor__slash-desc {
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
  }
</style>
