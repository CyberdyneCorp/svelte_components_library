<svelte:options runes={true} />

<script lang="ts">
  import MarkdownPreview from "../MarkdownPreview/MarkdownPreview.svelte";
  import {
    parseMarkdownToBlocks,
    serializeBlocksToMarkdown,
    detectBlockType,
    isMultiLineBlock,
    createBlock,
    type Block,
    type BlockType,
  } from "../BlockEditor/block-utils.js";

  let {
    value = $bindable(""),
    readonly = false,
    onchange,
    onactivetextarea,
  }: {
    value?: string;
    readonly?: boolean;
    onchange?: (value: string) => void;
    onactivetextarea?: (el: HTMLTextAreaElement | null) => void;
  } = $props();

  let blocks = $state<Block[]>(parseMarkdownToBlocks(value));
  let activeBlockId: string | null = $state(null);
  let editContent = $state("");
  let textareaEl: HTMLTextAreaElement | undefined = $state();
  let lastSerialized = $state(value);
  let containerEl: HTMLDivElement | undefined = $state();

  // Sync blocks when value changes externally
  $effect(() => {
    if (value !== lastSerialized) {
      blocks = parseMarkdownToBlocks(value);
      lastSerialized = value;
      activeBlockId = null;
    }
  });

  // Auto-resize textarea
  $effect(() => {
    if (textareaEl && activeBlockId) {
      void editContent;
      textareaEl.style.height = "auto";
      textareaEl.style.height = textareaEl.scrollHeight + "px";
    }
  });

  // Notify parent of active textarea
  $effect(() => {
    if (textareaEl && activeBlockId) {
      onactivetextarea?.(textareaEl);
      textareaEl.focus();
      textareaEl.selectionStart = textareaEl.selectionEnd = textareaEl.value.length;
    } else if (!activeBlockId) {
      onactivetextarea?.(null);
    }
  });

  function syncToValue() {
    const md = serializeBlocksToMarkdown(blocks);
    if (md !== value) {
      lastSerialized = md;
      value = md;
      onchange?.(md);
    }
  }

  function activateBlock(blockId: string) {
    if (readonly) return;
    // Commit any currently active block first
    if (activeBlockId && activeBlockId !== blockId) {
      commitActiveBlock();
    }
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    activeBlockId = blockId;
    editContent = block.content;
  }

  function commitActiveBlock() {
    if (!activeBlockId) return;
    const idx = blocks.findIndex((b) => b.id === activeBlockId);
    if (idx === -1) return;

    // Re-parse in case edits created multiple blocks (e.g., pasted content)
    const parsed = parseMarkdownToBlocks(editContent);
    if (parsed.length === 1 && parsed[0].content === "" && editContent === "") {
      // Keep the empty block
      blocks[idx] = { ...blocks[idx], content: "", type: "paragraph" };
    } else if (parsed.length === 1) {
      blocks[idx] = { ...blocks[idx], content: editContent, type: detectBlockType(editContent) };
    } else {
      // Multiple blocks from edit — splice them in
      const newBlocks = parsed.map((b) => createBlock(b.content));
      blocks = [...blocks.slice(0, idx), ...newBlocks, ...blocks.slice(idx + 1)];
    }

    activeBlockId = null;
    textareaEl = undefined;
    syncToValue();
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    editContent = target.value;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!textareaEl) return;
    const type: BlockType = detectBlockType(editContent);
    const isMultiLine = isMultiLineBlock(type);

    // Enter key
    if (e.key === "Enter" && !e.shiftKey) {
      if (isMultiLine) {
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
          const lineStart = textBeforeCursor.lastIndexOf("\n") + 1;
          editContent = editContent.substring(0, lineStart).replace(/\n$/, "") +
            editContent.substring(cursorPos);
          commitAndCreateAfter();
          return;
        }
        return; // let Enter add newline
      }

      // Single-line: commit + create after
      e.preventDefault();
      commitAndCreateAfter();
      return;
    }

    // Escape: commit
    if (e.key === "Escape") {
      e.preventDefault();
      commitActiveBlock();
      return;
    }

    // Backspace at position 0
    if (e.key === "Backspace" && textareaEl.selectionStart === 0 && textareaEl.selectionEnd === 0) {
      if (editContent === "") {
        e.preventDefault();
        deleteActiveBlock();
        return;
      }
      // Merge with previous block
      const idx = blocks.findIndex((b) => b.id === activeBlockId);
      if (idx > 0) {
        e.preventDefault();
        const prevBlock = blocks[idx - 1];
        const mergedContent = prevBlock.content + "\n" + editContent;
        blocks[idx - 1] = { ...prevBlock, content: mergedContent, type: detectBlockType(mergedContent) };
        blocks = [...blocks.slice(0, idx), ...blocks.slice(idx + 1)];
        activeBlockId = null;
        textareaEl = undefined;
        syncToValue();
        // Activate the merged block
        requestAnimationFrame(() => activateBlock(prevBlock.id));
      }
      return;
    }

    // ArrowUp at first line
    if (e.key === "ArrowUp") {
      const cursorPos = textareaEl.selectionStart;
      const textBeforeCursor = editContent.substring(0, cursorPos);
      if (!textBeforeCursor.includes("\n")) {
        e.preventDefault();
        const idx = blocks.findIndex((b) => b.id === activeBlockId);
        if (idx > 0) {
          commitActiveBlock();
          activateBlock(blocks[idx - 1].id);
        }
        return;
      }
    }

    // ArrowDown at last line
    if (e.key === "ArrowDown") {
      const cursorPos = textareaEl.selectionStart;
      const textAfterCursor = editContent.substring(cursorPos);
      if (!textAfterCursor.includes("\n")) {
        e.preventDefault();
        const idx = blocks.findIndex((b) => b.id === activeBlockId);
        if (idx < blocks.length - 1) {
          commitActiveBlock();
          activateBlock(blocks[idx + 1].id);
        }
        return;
      }
    }

    // Tab in code/mermaid/math blocks
    if (e.key === "Tab" && (type === "code-block" || type === "mermaid" || type === "math")) {
      e.preventDefault();
      const start = textareaEl.selectionStart;
      const end = textareaEl.selectionEnd;
      editContent = editContent.substring(0, start) + "  " + editContent.substring(end);
      requestAnimationFrame(() => {
        if (textareaEl) {
          textareaEl.selectionStart = textareaEl.selectionEnd = start + 2;
        }
      });
    }
  }

  function commitAndCreateAfter() {
    const idx = blocks.findIndex((b) => b.id === activeBlockId);
    if (idx === -1) return;

    // Commit current block
    blocks[idx] = { ...blocks[idx], content: editContent, type: detectBlockType(editContent) };
    const newBlock = createBlock("");
    blocks = [...blocks.slice(0, idx + 1), newBlock, ...blocks.slice(idx + 1)];
    activeBlockId = null;
    textareaEl = undefined;
    syncToValue();
    requestAnimationFrame(() => activateBlock(newBlock.id));
  }

  function deleteActiveBlock() {
    const idx = blocks.findIndex((b) => b.id === activeBlockId);
    if (idx === -1) return;

    if (blocks.length <= 1) {
      // Don't delete the last block, just clear it
      blocks[0] = { ...blocks[0], content: "", type: "paragraph" };
      editContent = "";
      syncToValue();
      return;
    }

    blocks = [...blocks.slice(0, idx), ...blocks.slice(idx + 1)];
    activeBlockId = null;
    textareaEl = undefined;
    syncToValue();

    // Focus previous or next block
    const focusIdx = idx > 0 ? idx - 1 : 0;
    if (blocks[focusIdx]) {
      requestAnimationFrame(() => activateBlock(blocks[focusIdx].id));
    }
  }

  function handleBlur(e: FocusEvent) {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (relatedTarget) {
      // Don't commit if focus is going to toolbar or within this component
      const isToolbar = relatedTarget.closest(".cy-md-toolbar");
      const isEditorHeader = relatedTarget.closest(".cy-md-editor__header");
      if (isToolbar || isEditorHeader) return;
    }
    commitActiveBlock();
  }

  function handleCheckboxClick(e: Event, blockId: string) {
    const target = e.target as HTMLElement;
    if (target.tagName !== "INPUT" || target.getAttribute("type") !== "checkbox") return;

    e.preventDefault();
    e.stopPropagation();

    const block = blocks.find((b) => b.id === blockId);
    if (!block || block.type !== "task-list") return;

    // Find which checkbox was clicked by counting preceding checkboxes
    const blockContainer = target.closest(".cy-editable-preview__block-preview");
    if (!blockContainer) return;
    const checkboxes = blockContainer.querySelectorAll('input[type="checkbox"]');
    let checkboxIdx = -1;
    checkboxes.forEach((cb, i) => {
      if (cb === target) checkboxIdx = i;
    });
    if (checkboxIdx === -1) return;

    // Toggle the checkbox in the markdown source
    const lines = block.content.split("\n");
    let taskIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (/^[-*]\s+\[[ x]\]\s/.test(lines[i])) {
        if (taskIdx === checkboxIdx) {
          if (/\[ \]/.test(lines[i])) {
            lines[i] = lines[i].replace("[ ]", "[x]");
          } else {
            lines[i] = lines[i].replace("[x]", "[ ]");
          }
          break;
        }
        taskIdx++;
      }
    }

    const idx = blocks.findIndex((b) => b.id === blockId);
    if (idx !== -1) {
      blocks[idx] = { ...blocks[idx], content: lines.join("\n") };
      blocks = [...blocks]; // trigger reactivity
      syncToValue();
    }
  }
</script>

<div class="cy-editable-preview" bind:this={containerEl}>
  {#each blocks as block (block.id)}
    <div class="cy-editable-preview__block" class:cy-editable-preview__block--active={activeBlockId === block.id}>
      {#if activeBlockId === block.id && !readonly}
        <textarea
          bind:this={textareaEl}
          class="cy-editable-preview__textarea"
          class:cy-editable-preview__textarea--mono={block.type === "code-block" || block.type === "mermaid" || block.type === "math"}
          value={editContent}
          oninput={handleInput}
          onkeydown={handleKeydown}
          onblur={handleBlur}
          spellcheck="false"
          rows="1"
        ></textarea>
      {:else}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="cy-editable-preview__block-preview"
          onclick={(e) => {
            handleCheckboxClick(e, block.id);
            const target = e.target as HTMLElement;
            if (target.tagName !== "INPUT") activateBlock(block.id);
          }}
          onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") activateBlock(block.id); }}
          role={readonly ? "presentation" : "button"}
          tabindex={readonly ? -1 : 0}
        >
          {#if block.content.trim()}
            <MarkdownPreview content={block.content} />
          {:else}
            <span class="cy-editable-preview__placeholder">Click to edit...</span>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .cy-editable-preview {
    min-height: 100%;
  }

  .cy-editable-preview__block {
    position: relative;
    border-radius: 4px;
    transition: background 100ms ease;
  }

  .cy-editable-preview__block:hover {
    background: var(--color-surface-raised);
  }

  .cy-editable-preview__block--active {
    background: var(--color-surface-raised);
  }

  .cy-editable-preview__block-preview {
    cursor: text;
    min-height: 1.5em;
    border-radius: 4px;
    padding: 2px 4px;
    transition: outline 100ms ease;
    outline: 2px solid transparent;
  }

  .cy-editable-preview__block-preview:hover {
    outline-color: var(--color-border-subtle);
  }

  .cy-editable-preview__block-preview:focus-visible {
    outline-color: var(--color-action-brand-default);
  }

  .cy-editable-preview__textarea {
    display: block;
    width: 100%;
    background: var(--color-surface-raised);
    color: var(--color-text-primary);
    border: 2px solid var(--color-action-brand-default);
    border-radius: 4px;
    padding: 8px;
    font-family: var(--font-body, "Inter", sans-serif);
    font-size: 0.875rem;
    line-height: 1.7;
    resize: none;
    outline: none;
    overflow: hidden;
    caret-color: var(--color-action-brand-default);
    tab-size: 2;
    min-height: 1.7em;
  }

  .cy-editable-preview__textarea--mono {
    font-family: var(--font-mono, "JetBrains Mono", monospace);
  }

  .cy-editable-preview__textarea::placeholder {
    color: var(--color-text-tertiary);
  }

  .cy-editable-preview__placeholder {
    color: var(--color-text-tertiary);
    font-style: italic;
    font-size: 0.875rem;
  }

  /* Remove extra margins from MarkdownPreview inside blocks */
  .cy-editable-preview__block-preview :global(.cy-md-preview > p:first-child) {
    margin-top: 0;
  }

  .cy-editable-preview__block-preview :global(.cy-md-preview > p:last-child) {
    margin-bottom: 0;
  }

  .cy-editable-preview__block-preview :global(.cy-md-preview > h1:first-child),
  .cy-editable-preview__block-preview :global(.cy-md-preview > h2:first-child),
  .cy-editable-preview__block-preview :global(.cy-md-preview > h3:first-child),
  .cy-editable-preview__block-preview :global(.cy-md-preview > h4:first-child),
  .cy-editable-preview__block-preview :global(.cy-md-preview > h5:first-child),
  .cy-editable-preview__block-preview :global(.cy-md-preview > h6:first-child) {
    margin-top: 0;
  }

  .cy-editable-preview__block-preview :global(.cy-md-preview > ul:first-child),
  .cy-editable-preview__block-preview :global(.cy-md-preview > ol:first-child) {
    margin-top: 0;
  }

  .cy-editable-preview__block-preview :global(.cy-md-preview > ul:last-child),
  .cy-editable-preview__block-preview :global(.cy-md-preview > ol:last-child) {
    margin-bottom: 0;
  }

  /* Enable checkbox clicking in task lists */
  .cy-editable-preview__block-preview :global(.cy-md-task input[type="checkbox"]) {
    cursor: pointer;
    pointer-events: auto;
  }
</style>
