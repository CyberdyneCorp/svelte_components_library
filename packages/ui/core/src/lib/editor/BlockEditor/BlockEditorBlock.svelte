<svelte:options runes={true} />

<script lang="ts">
  import MarkdownPreview from "../MarkdownPreview/MarkdownPreview.svelte";
  import { detectBlockType, isMultiLineBlock, type Block, type BlockType } from "./block-utils.js";

  let {
    block,
    active = false,
    readonly = false,
    placeholder = "Type '/' for commands...",
    oncommit,
    oncreateafter,
    ondelete,
    onmerge,
    onactivate,
    onfocusprev,
    onfocusnext,
    ondragstart,
    ondragover,
    ondrop,
    ondragend,
    onslashopen,
    onslashclose,
    ontextareaready,
    oncontentchange,
  }: {
    block: Block;
    active?: boolean;
    readonly?: boolean;
    placeholder?: string;
    oncommit?: (content: string) => void;
    oncreateafter?: (content?: string) => void;
    ondelete?: () => void;
    onmerge?: () => void;
    onactivate?: () => void;
    onfocusprev?: () => void;
    onfocusnext?: () => void;
    ondragstart?: (e: DragEvent) => void;
    ondragover?: (e: DragEvent) => void;
    ondrop?: (e: DragEvent) => void;
    ondragend?: (e: DragEvent) => void;
    onslashopen?: (filter: string, rect: { top: number; left: number }) => void;
    onslashclose?: () => void;
    ontextareaready?: (el: HTMLTextAreaElement) => void;
    oncontentchange?: (content: string) => void;
  } = $props();

  let textareaEl: HTMLTextAreaElement | undefined = $state();
  let editContent = $state("");
  let blockEl: HTMLDivElement | undefined = $state();
  let slashFilter = $state("");
  let isDragOver = $state(false);

  // Sync editContent when block changes externally or when we become active
  $effect(() => {
    const content = block.content;
    if (active) {
      editContent = content;
    }
  });

  // Auto-resize textarea
  $effect(() => {
    if (textareaEl && active) {
      void editContent;
      textareaEl.style.height = "auto";
      textareaEl.style.height = textareaEl.scrollHeight + "px";
    }
  });

  // Notify parent when textarea is ready
  $effect(() => {
    if (textareaEl && active) {
      ontextareaready?.(textareaEl);
      textareaEl.focus();
      // Place cursor at the end
      textareaEl.selectionStart = textareaEl.selectionEnd = textareaEl.value.length;
    }
  });

  function currentBlockType(): BlockType {
    return detectBlockType(editContent);
  }

  function commitBlock() {
    onslashclose?.();
    oncommit?.(editContent);
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    editContent = target.value;
    oncontentchange?.(editContent);

    // Slash menu detection: "/" at the start of content or after a newline
    const cursorPos = target.selectionStart;
    const textBeforeCursor = editContent.substring(0, cursorPos);
    const currentLine = textBeforeCursor.split("\n").pop() || "";

    if (currentLine.startsWith("/")) {
      slashFilter = currentLine.substring(1);
      if (textareaEl) {
        const rect = textareaEl.getBoundingClientRect();
        onslashopen?.(slashFilter, {
          top: rect.bottom + 4,
          left: rect.left,
        });
      }
    } else {
      slashFilter = "";
      onslashclose?.();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!textareaEl) return;
    const type = currentBlockType();
    const isMultiLine = isMultiLineBlock(type);

    // Enter key
    if (e.key === "Enter" && !e.shiftKey) {
      if (isMultiLine) {
        // For lists: if current line is just the marker (e.g., "- "), commit
        const cursorPos = textareaEl.selectionStart;
        const textBeforeCursor = editContent.substring(0, cursorPos);
        const currentLine = textBeforeCursor.split("\n").pop() || "";

        const isEmptyListItem =
          /^[-*]\s*$/.test(currentLine) ||
          /^\d+\.\s*$/.test(currentLine) ||
          /^[-*]\s+\[[ x]\]\s*$/.test(currentLine) ||
          /^>\s*$/.test(currentLine);

        if (isEmptyListItem) {
          e.preventDefault();
          // Remove the empty line marker before committing
          const lineStart = textBeforeCursor.lastIndexOf("\n") + 1;
          editContent = editContent.substring(0, lineStart).replace(/\n$/, "") +
            editContent.substring(cursorPos);
          commitBlock();
          oncreateafter?.();
          return;
        }
        // Otherwise let Enter add newline naturally
        return;
      }

      // Single-line blocks: Enter commits and creates new block
      e.preventDefault();
      commitBlock();
      oncreateafter?.();
      return;
    }

    // Escape: commit current block
    if (e.key === "Escape") {
      e.preventDefault();
      commitBlock();
      return;
    }

    // Backspace at position 0
    if (e.key === "Backspace" && textareaEl.selectionStart === 0 && textareaEl.selectionEnd === 0) {
      e.preventDefault();
      if (editContent === "") {
        ondelete?.();
      } else {
        onmerge?.();
      }
      return;
    }

    // ArrowUp at first line
    if (e.key === "ArrowUp") {
      const cursorPos = textareaEl.selectionStart;
      const textBeforeCursor = editContent.substring(0, cursorPos);
      const isFirstLine = !textBeforeCursor.includes("\n");
      if (isFirstLine) {
        e.preventDefault();
        commitBlock();
        onfocusprev?.();
        return;
      }
    }

    // ArrowDown at last line
    if (e.key === "ArrowDown") {
      const cursorPos = textareaEl.selectionStart;
      const textAfterCursor = editContent.substring(cursorPos);
      const isLastLine = !textAfterCursor.includes("\n");
      if (isLastLine) {
        e.preventDefault();
        commitBlock();
        onfocusnext?.();
        return;
      }
    }

    // Tab in code blocks inserts spaces
    if (e.key === "Tab" && (type === "code-block" || type === "mermaid")) {
      e.preventDefault();
      const start = textareaEl.selectionStart;
      const end = textareaEl.selectionEnd;
      editContent = editContent.substring(0, start) + "  " + editContent.substring(end);
      // Need to update textarea and cursor position after state update
      requestAnimationFrame(() => {
        if (textareaEl) {
          textareaEl.selectionStart = textareaEl.selectionEnd = start + 2;
        }
      });
    }
  }

  function handleBlur(e: FocusEvent) {
    // Don't commit if focus is going to a toolbar button or slash menu
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (relatedTarget) {
      const isToolbar = relatedTarget.closest(".cy-block-editor__toolbar");
      const isSlashMenu = relatedTarget.closest(".cy-block-editor__slash-menu");
      if (isToolbar || isSlashMenu) return;
    }
    commitBlock();
  }

  function handlePreviewClick() {
    if (readonly) return;
    onactivate?.();
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragOver = true;
    ondragover?.(e);
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  function handleDrop(e: DragEvent) {
    isDragOver = false;
    ondrop?.(e);
  }
</script>

<div
  class="cy-block-editor__block"
  class:cy-block-editor__block--active={active}
  class:cy-block-editor__block--drag-over={isDragOver}
  class:cy-block-editor__block--empty={!block.content.trim() && !active}
  bind:this={blockEl}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  role="presentation"
>
  <!-- Drag handle -->
  {#if !readonly}
    <div
      class="cy-block-editor__handle"
      draggable="true"
      ondragstart={ondragstart}
      ondragend={ondragend}
      role="button"
      tabindex="-1"
      aria-label="Drag to reorder"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
      </svg>
    </div>
  {/if}

  <!-- Block content -->
  <div class="cy-block-editor__block-content">
    {#if active && !readonly}
      <textarea
        bind:this={textareaEl}
        class="cy-block-editor__textarea"
        value={editContent}
        placeholder={placeholder}
        oninput={handleInput}
        onkeydown={handleKeydown}
        onblur={handleBlur}
        spellcheck="false"
        rows="1"
      ></textarea>
    {:else}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div
        class="cy-block-editor__preview"
        onclick={handlePreviewClick}
        role={readonly ? "presentation" : "button"}
        tabindex={readonly ? -1 : 0}
        onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") handlePreviewClick(); }}
      >
        {#if block.content.trim()}
          <MarkdownPreview content={block.content} />
        {:else}
          <span class="cy-block-editor__placeholder">{placeholder}</span>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .cy-block-editor__block {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    position: relative;
    border-radius: 4px;
    transition: background 100ms ease;
  }

  .cy-block-editor__block:hover {
    background: var(--color-surface-raised);
  }

  .cy-block-editor__block--active {
    background: var(--color-surface-raised);
  }

  .cy-block-editor__block--drag-over {
    border-top: 2px solid var(--color-action-brand-default);
  }

  .cy-block-editor__handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-top: 4px;
    border-radius: 4px;
    color: var(--color-text-tertiary);
    cursor: grab;
    opacity: 0;
    transition: opacity 150ms ease, color 150ms ease;
    flex-shrink: 0;
  }

  .cy-block-editor__block:hover .cy-block-editor__handle,
  .cy-block-editor__block--active .cy-block-editor__handle {
    opacity: 1;
  }

  .cy-block-editor__handle:hover {
    color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
  }

  .cy-block-editor__handle:active {
    cursor: grabbing;
  }

  .cy-block-editor__block-content {
    flex: 1;
    min-width: 0;
  }

  .cy-block-editor__textarea {
    display: block;
    width: 100%;
    background: transparent;
    color: var(--color-text-primary);
    border: none;
    padding: 4px 8px;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 0.875rem;
    line-height: 1.7;
    resize: none;
    outline: none;
    overflow: hidden;
    caret-color: var(--color-action-brand-default);
    tab-size: 2;
    min-height: 1.7em;
  }

  .cy-block-editor__textarea::placeholder {
    color: var(--color-text-tertiary);
  }

  .cy-block-editor__preview {
    padding: 2px 8px;
    cursor: text;
    min-height: 1.5em;
    border-radius: 4px;
    transition: outline 100ms ease;
    outline: 2px solid transparent;
  }

  .cy-block-editor__preview:hover {
    outline-color: var(--color-border-subtle);
  }

  .cy-block-editor__preview:focus-visible {
    outline-color: var(--color-action-brand-default);
  }

  .cy-block-editor__placeholder {
    color: var(--color-text-tertiary);
    font-style: italic;
    font-size: 0.875rem;
  }

  /* Remove extra margins from MarkdownPreview when inside a block */
  .cy-block-editor__preview :global(.cy-md-preview) {
    line-height: 1.6;
  }

  .cy-block-editor__preview :global(.cy-md-preview > p:first-child) {
    margin-top: 0;
  }

  .cy-block-editor__preview :global(.cy-md-preview > p:last-child) {
    margin-bottom: 0;
  }

  .cy-block-editor__preview :global(.cy-md-preview > h1:first-child),
  .cy-block-editor__preview :global(.cy-md-preview > h2:first-child),
  .cy-block-editor__preview :global(.cy-md-preview > h3:first-child),
  .cy-block-editor__preview :global(.cy-md-preview > h4:first-child),
  .cy-block-editor__preview :global(.cy-md-preview > h5:first-child),
  .cy-block-editor__preview :global(.cy-md-preview > h6:first-child) {
    margin-top: 0;
  }

  .cy-block-editor__preview :global(.cy-md-preview > ul:first-child),
  .cy-block-editor__preview :global(.cy-md-preview > ol:first-child) {
    margin-top: 0;
  }

  .cy-block-editor__preview :global(.cy-md-preview > ul:last-child),
  .cy-block-editor__preview :global(.cy-md-preview > ol:last-child) {
    margin-bottom: 0;
  }
</style>
