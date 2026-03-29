<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import MarkdownToolbar from "../MarkdownToolbar/MarkdownToolbar.svelte";
  import MarkdownPreview from "../MarkdownPreview/MarkdownPreview.svelte";

  let {
    value = $bindable(""),
    mode = $bindable("split"),
    placeholder = "Write your markdown here...",
    readonly = false,
    height = "600px",
    label = "",
    showToolbar = true,
    onchange,
  }: {
    value?: string;
    mode?: "edit" | "preview" | "split";
    placeholder?: string;
    readonly?: boolean;
    height?: string;
    label?: string;
    showToolbar?: boolean;
    onchange?: (value: string) => void;
  } = $props();

  let textareaEl: HTMLTextAreaElement | null = $state(null);
  let previewEl: HTMLDivElement | null = $state(null);
  let debouncedValue = $state(value);
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  // Sync external value changes
  $effect(() => {
    debouncedValue = value;
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    onchange?.(value);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debouncedValue = value;
    }, 150);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!textareaEl) return;

    // Tab inserts 2 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textareaEl.selectionStart;
      const end = textareaEl.selectionEnd;
      const newVal = textareaEl.value.substring(0, start) + "  " + textareaEl.value.substring(end);
      textareaEl.value = newVal;
      textareaEl.selectionStart = textareaEl.selectionEnd = start + 2;
      textareaEl.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Auto-indent on Enter
    if (e.key === "Enter") {
      const start = textareaEl.selectionStart;
      const textBefore = textareaEl.value.substring(0, start);
      const currentLine = textBefore.split("\n").pop() || "";
      const indent = currentLine.match(/^(\s*)/)?.[1] || "";

      if (indent) {
        e.preventDefault();
        const end = textareaEl.selectionEnd;
        const insertion = "\n" + indent;
        const newVal = textareaEl.value.substring(0, start) + insertion + textareaEl.value.substring(end);
        textareaEl.value = newVal;
        const newPos = start + insertion.length;
        textareaEl.selectionStart = textareaEl.selectionEnd = newPos;
        textareaEl.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  }

  // Scroll sync in split mode
  function handleTextareaScroll() {
    if (mode !== "split" || !textareaEl || !previewEl) return;
    const ratio = textareaEl.scrollTop / (textareaEl.scrollHeight - textareaEl.clientHeight || 1);
    previewEl.scrollTop = ratio * (previewEl.scrollHeight - previewEl.clientHeight);
  }

  function handleToolbarInsert(text: string) {
    value = text;
    onchange?.(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debouncedValue = value;
    }, 150);
  }

  onDestroy(() => {
    clearTimeout(debounceTimer);
  });
</script>

<div class="cy-md-editor" style="height: {height}">
  <!-- Header -->
  <div class="cy-md-editor__header">
    {#if label}
      <span class="cy-md-editor__label">{label}</span>
    {/if}
    <div class="cy-md-editor__modes">
      <button
        type="button"
        class="cy-md-editor__mode-btn"
        class:cy-md-editor__mode-btn--active={mode === "edit"}
        onclick={() => mode = "edit"}
      >Edit</button>
      <button
        type="button"
        class="cy-md-editor__mode-btn"
        class:cy-md-editor__mode-btn--active={mode === "split"}
        onclick={() => mode = "split"}
      >Split</button>
      <button
        type="button"
        class="cy-md-editor__mode-btn"
        class:cy-md-editor__mode-btn--active={mode === "preview"}
        onclick={() => mode = "preview"}
      >Preview</button>
    </div>
  </div>

  <!-- Toolbar -->
  {#if showToolbar && mode !== "preview" && !readonly}
    <MarkdownToolbar
      bind:textarea={textareaEl}
      oninsert={handleToolbarInsert}
      disabled={readonly}
    />
  {/if}

  <!-- Content -->
  <div class="cy-md-editor__content" class:cy-md-editor__content--split={mode === "split"}>
    {#if mode === "edit" || mode === "split"}
      <div class="cy-md-editor__edit-pane" class:cy-md-editor__edit-pane--full={mode === "edit"}>
        <textarea
          bind:this={textareaEl}
          class="cy-md-editor__textarea"
          value={value}
          {placeholder}
          {readonly}
          oninput={handleInput}
          onkeydown={handleKeydown}
          onscroll={handleTextareaScroll}
          spellcheck="false"
        ></textarea>
      </div>
    {/if}

    {#if mode === "split"}
      <div class="cy-md-editor__divider"></div>
    {/if}

    {#if mode === "preview" || mode === "split"}
      <div
        class="cy-md-editor__preview-pane"
        class:cy-md-editor__preview-pane--full={mode === "preview"}
        bind:this={previewEl}
      >
        <MarkdownPreview content={debouncedValue} />
      </div>
    {/if}
  </div>
</div>

<style>
  .cy-md-editor {
    display: flex;
    flex-direction: column;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-subtle);
    border-radius: 8px;
    overflow: hidden;
    min-width: 600px;
  }

  .cy-md-editor__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--color-bg-primary);
    border-bottom: 1px solid var(--color-border-subtle);
    min-height: 40px;
  }

  .cy-md-editor__label {
    font-family: var(--font-display, "Orbitron", sans-serif);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-action-brand-default);
  }

  .cy-md-editor__modes {
    display: flex;
    gap: 0;
    margin-left: auto;
    background: var(--color-surface-default);
    border-radius: 6px;
    padding: 2px;
    border: 1px solid var(--color-border-subtle);
  }

  .cy-md-editor__mode-btn {
    padding: 4px 14px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--color-text-secondary);
    font-family: var(--font-body, "Inter", sans-serif);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .cy-md-editor__mode-btn:hover {
    color: var(--color-text-primary);
  }

  .cy-md-editor__mode-btn--active {
    background: var(--color-state-success-bg);
    color: var(--color-action-brand-default);
  }

  .cy-md-editor__content {
    flex: 1;
    display: flex;
    overflow: hidden;
    min-height: 0;
  }

  .cy-md-editor__content--split {
    flex-direction: row;
  }

  .cy-md-editor__edit-pane {
    flex: 1;
    display: flex;
    overflow: hidden;
    min-width: 0;
  }

  .cy-md-editor__edit-pane--full {
    width: 100%;
  }

  .cy-md-editor__textarea {
    flex: 1;
    width: 100%;
    background: var(--color-surface-default);
    color: var(--color-text-primary);
    border: none;
    padding: 16px;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 0.875rem;
    line-height: 1.7;
    resize: none;
    outline: none;
    caret-color: var(--color-action-brand-default);
    overflow-y: auto;
    tab-size: 2;
  }

  .cy-md-editor__textarea::placeholder {
    color: var(--color-text-tertiary);
  }

  .cy-md-editor__divider {
    width: 1px;
    background: var(--color-border-subtle);
    flex-shrink: 0;
  }

  .cy-md-editor__preview-pane {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: var(--color-bg-primary);
    min-width: 0;
  }

  .cy-md-editor__preview-pane--full {
    width: 100%;
  }
</style>
