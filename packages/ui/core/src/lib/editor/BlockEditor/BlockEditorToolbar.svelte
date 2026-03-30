<svelte:options runes={true} />

<script lang="ts">
  import { insertMarkdown, insertLine, insertBlock } from "./block-utils.js";

  let {
    textarea = $bindable(null),
    disabled = false,
    oninsert,
    customActions,
  }: {
    textarea?: HTMLTextAreaElement | null;
    disabled?: boolean;
    oninsert?: (value: string) => void;
    customActions?: Array<{ label: string; icon: string; action: (textarea: HTMLTextAreaElement) => void }>;
  } = $props();

  let showHeadingDropdown = $state(false);

  let isDisabled = $derived(disabled || !textarea);

  function doInsertMarkdown(before: string, after: string, defaultText: string) {
    if (!textarea) return;
    const result = insertMarkdown(textarea, before, after, defaultText);
    oninsert?.(result);
  }

  function doInsertLine(prefix: string, defaultText: string) {
    if (!textarea) return;
    const result = insertLine(textarea, prefix, defaultText);
    oninsert?.(result);
  }

  function doInsertBlock(text: string) {
    if (!textarea) return;
    const result = insertBlock(textarea, text);
    oninsert?.(result);
  }

  function handleHeading(level: number) {
    const prefix = "#".repeat(level) + " ";
    doInsertLine(prefix, "Heading");
    showHeadingDropdown = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (isDisabled) return;
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;

    if (e.key === "b") {
      e.preventDefault();
      doInsertMarkdown("**", "**", "bold text");
    } else if (e.key === "i") {
      e.preventDefault();
      doInsertMarkdown("*", "*", "italic text");
    } else if (e.key === "k") {
      e.preventDefault();
      doInsertMarkdown("[", "](url)", "link text");
    }
  }

  $effect(() => {
    const el = textarea;
    if (!el) return;
    el.addEventListener("keydown", handleKeydown);
    return () => el.removeEventListener("keydown", handleKeydown);
  });

  function handleWindowClick() {
    showHeadingDropdown = false;
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="cy-block-editor__toolbar" class:cy-block-editor__toolbar--disabled={isDisabled} role="toolbar" aria-label="Formatting toolbar">
  <!-- Bold -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Bold (Ctrl+B)"
    disabled={isDisabled}
    onclick={() => doInsertMarkdown("**", "**", "bold text")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  </button>

  <!-- Italic -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Italic (Ctrl+I)"
    disabled={isDisabled}
    onclick={() => doInsertMarkdown("*", "*", "italic text")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  </button>

  <!-- Strikethrough -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Strikethrough"
    disabled={isDisabled}
    onclick={() => doInsertMarkdown("~~", "~~", "strikethrough")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.3 4.9c-1.7-1.4-4.2-1.7-6.3-.9A5.4 5.4 0 0 0 8 8.4c0 .8.2 1.5.5 2.1" /><path d="M4 12h16" /><path d="M6.7 19.1c1.7 1.4 4.2 1.7 6.3.9a5.4 5.4 0 0 0 3-4.4c0-.8-.2-1.5-.5-2.1" />
    </svg>
  </button>

  <div class="cy-block-editor__toolbar-sep"></div>

  <!-- Heading dropdown -->
  <div class="cy-block-editor__toolbar-dropdown-wrap">
    <button
      type="button"
      class="cy-block-editor__toolbar-btn"
      title="Heading"
      disabled={isDisabled}
      onclick={(e) => { e.stopPropagation(); showHeadingDropdown = !showHeadingDropdown; }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="M17 12l3-2v8" />
      </svg>
    </button>
    {#if showHeadingDropdown && !isDisabled}
      <div class="cy-block-editor__toolbar-dropdown" onclick={(e) => e.stopPropagation()} role="presentation">
        <button type="button" onclick={() => handleHeading(1)}>H1</button>
        <button type="button" onclick={() => handleHeading(2)}>H2</button>
        <button type="button" onclick={() => handleHeading(3)}>H3</button>
        <button type="button" onclick={() => handleHeading(4)}>H4</button>
      </div>
    {/if}
  </div>

  <div class="cy-block-editor__toolbar-sep"></div>

  <!-- Link -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Link (Ctrl+K)"
    disabled={isDisabled}
    onclick={() => doInsertMarkdown("[", "](url)", "link text")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  </button>

  <!-- Image -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Image"
    disabled={isDisabled}
    onclick={() => doInsertMarkdown("![", "](image-url)", "alt text")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  </button>

  <div class="cy-block-editor__toolbar-sep"></div>

  <!-- Inline code -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Inline code"
    disabled={isDisabled}
    onclick={() => doInsertMarkdown("`", "`", "code")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  </button>

  <!-- Code block -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Code block"
    disabled={isDisabled}
    onclick={() => doInsertBlock("```\ncode here\n```")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><polyline points="9 8 5 12 9 16" /><polyline points="15 8 19 12 15 16" />
    </svg>
  </button>

  <div class="cy-block-editor__toolbar-sep"></div>

  <!-- Blockquote -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Blockquote"
    disabled={isDisabled}
    onclick={() => doInsertLine("> ", "quote")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.68 11 13.166 11 15c0 1.933-1.567 3.5-3.5 3.5-1.294 0-2.442-.607-2.917-1.179zM14.583 17.321C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.68 21 13.166 21 15c0 1.933-1.567 3.5-3.5 3.5-1.294 0-2.442-.607-2.917-1.179z" />
    </svg>
  </button>

  <!-- Unordered list -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Bullet list"
    disabled={isDisabled}
    onclick={() => doInsertLine("- ", "list item")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  </button>

  <!-- Ordered list -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Numbered list"
    disabled={isDisabled}
    onclick={() => doInsertLine("1. ", "list item")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><text x="2" y="8" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif">1</text><text x="2" y="14" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif">2</text><text x="2" y="20" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif">3</text>
    </svg>
  </button>

  <!-- Task list -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Task list"
    disabled={isDisabled}
    onclick={() => doInsertLine("- [ ] ", "task")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="6" height="6" rx="1" /><path d="M5 11l1.5 1.5L9 9" /><line x1="12" y1="8" x2="21" y2="8" /><rect x="3" y="14" width="6" height="6" rx="1" /><line x1="12" y1="17" x2="21" y2="17" />
    </svg>
  </button>

  <div class="cy-block-editor__toolbar-sep"></div>

  <!-- Horizontal rule -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Horizontal rule"
    disabled={isDisabled}
    onclick={() => doInsertBlock("---")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  </button>

  <!-- Table -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Table"
    disabled={isDisabled}
    onclick={() => doInsertBlock("| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  </button>

  <!-- Mermaid -->
  <button
    type="button"
    class="cy-block-editor__toolbar-btn"
    title="Mermaid diagram"
    disabled={isDisabled}
    onclick={() => doInsertBlock("```mermaid\nflowchart TD\n    A[Start] --> B[Process]\n    B --> C{Decision}\n    C -->|Yes| D[End]\n    C -->|No| B\n```")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><line x1="12" y1="7" x2="5" y2="17" /><line x1="12" y1="7" x2="19" y2="17" />
    </svg>
  </button>

  {#if customActions && customActions.length > 0}
    <div class="cy-block-editor__toolbar-sep"></div>
    {#each customActions as action}
      <button
        type="button"
        class="cy-block-editor__toolbar-btn"
        title={action.label}
        disabled={isDisabled}
        onclick={() => { if (textarea) action.action(textarea); }}
      >
        {@html action.icon}
      </button>
    {/each}
  {/if}
</div>

<style>
  .cy-block-editor__toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 6px 8px;
    background: var(--color-surface-default);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-wrap: nowrap;
    overflow-x: auto;
    min-height: 44px;
  }

  .cy-block-editor__toolbar--disabled {
    opacity: 0.4;
  }

  .cy-block-editor__toolbar--disabled .cy-block-editor__toolbar-btn {
    cursor: default;
  }

  .cy-block-editor__toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .cy-block-editor__toolbar-btn:hover:not(:disabled) {
    color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
    border-color: var(--color-border-subtle);
  }

  .cy-block-editor__toolbar-btn:active:not(:disabled) {
    color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
  }

  .cy-block-editor__toolbar-btn:disabled {
    cursor: default;
  }

  .cy-block-editor__toolbar-sep {
    width: 1px;
    height: 20px;
    background: var(--color-border-subtle);
    margin: 0 4px;
  }

  .cy-block-editor__toolbar-dropdown-wrap {
    position: relative;
  }

  .cy-block-editor__toolbar-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-subtle);
    border-radius: 6px;
    padding: 4px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .cy-block-editor__toolbar-dropdown button {
    display: block;
    width: 100%;
    padding: 6px 16px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--color-text-secondary);
    font-family: var(--font-display, "Orbitron", sans-serif);
    font-size: 0.75rem;
    cursor: pointer;
    text-align: left;
    transition: all 150ms ease;
  }

  .cy-block-editor__toolbar-dropdown button:hover {
    color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
  }
</style>
