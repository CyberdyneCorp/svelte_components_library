<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable(""),
    placeholder = "Start writing...",
    readonly = false,
    height = "300px",
    showToolbar = true,
    onchange,
  }: {
    value?: string;
    placeholder?: string;
    readonly?: boolean;
    height?: string;
    showToolbar?: boolean;
    onchange?: (html: string) => void;
  } = $props();

  let editorEl: HTMLDivElement | undefined = $state();
  let activeFormats: Record<string, boolean> = $state({});
  let headingOpen = $state(false);

  function exec(command: string, val?: string) {
    document.execCommand(command, false, val);
    editorEl?.focus();
    updateActiveFormats();
    captureContent();
  }

  function updateActiveFormats() {
    activeFormats = {
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    };
  }

  function captureContent() {
    if (!editorEl) return;
    const html = editorEl.innerHTML;
    if (html !== value) {
      value = html;
      onchange?.(html);
    }
  }

  function handleInput() {
    captureContent();
    updateActiveFormats();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Tab") {
      e.preventDefault();
      exec("indent");
    }
    updateActiveFormats();
  }

  function handleKeyup() {
    updateActiveFormats();
  }

  function handleMouseup() {
    updateActiveFormats();
  }

  function setHeading(tag: string) {
    exec("formatBlock", tag);
    headingOpen = false;
  }

  function sanitizeHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/\bon\w+\s*=\s*[^\s>]+/gi, "")
      .replace(/javascript\s*:/gi, "");
  }

  function sanitizeUrl(url: string): string {
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:")) {
      return "#";
    }
    return url;
  }

  function insertLink() {
    const url = prompt("Enter URL:");
    if (url) {
      const safeUrl = sanitizeUrl(url);
      exec("createLink", safeUrl);
    }
  }

  $effect(() => {
    if (editorEl && value !== editorEl.innerHTML) {
      editorEl.innerHTML = sanitizeHtml(value);
    }
  });
</script>

<div class="cy-rte" class:cy-rte--readonly={readonly}>
  {#if showToolbar && !readonly}
    <div class="cy-rte__toolbar" role="toolbar" aria-label="Text formatting">
      <button
        class="cy-rte__btn"
        class:cy-rte__btn--active={activeFormats.bold}
        onclick={() => exec("bold")}
        title="Bold (Ctrl+B)"
        aria-label="Bold"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
        </svg>
      </button>

      <button
        class="cy-rte__btn"
        class:cy-rte__btn--active={activeFormats.italic}
        onclick={() => exec("italic")}
        title="Italic (Ctrl+I)"
        aria-label="Italic"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>
        </svg>
      </button>

      <button
        class="cy-rte__btn"
        class:cy-rte__btn--active={activeFormats.underline}
        onclick={() => exec("underline")}
        title="Underline (Ctrl+U)"
        aria-label="Underline"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>
        </svg>
      </button>

      <button
        class="cy-rte__btn"
        class:cy-rte__btn--active={activeFormats.strikeThrough}
        onclick={() => exec("strikeThrough")}
        title="Strikethrough"
        aria-label="Strikethrough"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H8"/><line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
      </button>

      <span class="cy-rte__separator"></span>

      <div class="cy-rte__dropdown">
        <button
          class="cy-rte__btn cy-rte__btn--wide"
          onclick={() => (headingOpen = !headingOpen)}
          title="Heading"
          aria-label="Heading"
          aria-expanded={headingOpen}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/>
          </svg>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        {#if headingOpen}
          <div class="cy-rte__dropdown-menu">
            <button class="cy-rte__dropdown-item" onclick={() => setHeading("h1")}>Heading 1</button>
            <button class="cy-rte__dropdown-item" onclick={() => setHeading("h2")}>Heading 2</button>
            <button class="cy-rte__dropdown-item" onclick={() => setHeading("h3")}>Heading 3</button>
            <button class="cy-rte__dropdown-item" onclick={() => setHeading("p")}>Paragraph</button>
          </div>
        {/if}
      </div>

      <span class="cy-rte__separator"></span>

      <button
        class="cy-rte__btn"
        class:cy-rte__btn--active={activeFormats.insertUnorderedList}
        onclick={() => exec("insertUnorderedList")}
        title="Bullet list"
        aria-label="Bullet list"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
        </svg>
      </button>

      <button
        class="cy-rte__btn"
        class:cy-rte__btn--active={activeFormats.insertOrderedList}
        onclick={() => exec("insertOrderedList")}
        title="Ordered list"
        aria-label="Ordered list"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
          <text x="1" y="8" font-size="8" fill="currentColor" stroke="none" font-family="sans-serif">1</text>
          <text x="1" y="14" font-size="8" fill="currentColor" stroke="none" font-family="sans-serif">2</text>
          <text x="1" y="20" font-size="8" fill="currentColor" stroke="none" font-family="sans-serif">3</text>
        </svg>
      </button>

      <span class="cy-rte__separator"></span>

      <button
        class="cy-rte__btn"
        onclick={insertLink}
        title="Insert link"
        aria-label="Insert link"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </button>

      <button
        class="cy-rte__btn"
        onclick={() => exec("unlink")}
        title="Remove link"
        aria-label="Remove link"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          <line x1="2" y1="2" x2="22" y2="22"/>
        </svg>
      </button>

      <button
        class="cy-rte__btn"
        onclick={() => exec("formatBlock", "blockquote")}
        title="Blockquote"
        aria-label="Blockquote"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
        </svg>
      </button>

      <button
        class="cy-rte__btn"
        onclick={() => exec("formatBlock", "pre")}
        title="Code block"
        aria-label="Code"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      </button>

      <button
        class="cy-rte__btn"
        onclick={() => exec("insertHorizontalRule")}
        title="Horizontal rule"
        aria-label="Horizontal rule"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
      </button>

      <span class="cy-rte__separator"></span>

      <button
        class="cy-rte__btn"
        onclick={() => exec("undo")}
        title="Undo"
        aria-label="Undo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
      </button>

      <button
        class="cy-rte__btn"
        onclick={() => exec("redo")}
        title="Redo"
        aria-label="Redo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/>
        </svg>
      </button>

      <button
        class="cy-rte__btn"
        onclick={() => exec("removeFormat")}
        title="Clear formatting"
        aria-label="Clear formatting"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/><line x1="2" y1="2" x2="22" y2="22"/>
        </svg>
      </button>
    </div>
  {/if}

  <div
    bind:this={editorEl}
    class="cy-rte__editor"
    contenteditable={!readonly}
    role="textbox"
    aria-multiline="true"
    aria-label="Rich text editor"
    tabindex="0"
    data-placeholder={placeholder}
    style:min-height={height}
    oninput={handleInput}
    onkeydown={handleKeydown}
    onkeyup={handleKeyup}
    onmouseup={handleMouseup}
    onfocus={updateActiveFormats}
  ></div>
</div>

<style>
  .cy-rte {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md, 8px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .cy-rte__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-2, 0.5rem);
    border-bottom: 1px solid var(--color-border-default);
    background: var(--color-surface-raised);
  }

  .cy-rte__separator {
    width: 1px;
    height: 20px;
    background: var(--color-border-default);
    margin: 0 var(--space-1, 0.25rem);
  }

  .cy-rte__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1, 0.25rem);
    width: 30px;
    height: 30px;
    border: none;
    border-radius: var(--radius-sm, 4px);
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-default, 0.15s ease);
  }

  .cy-rte__btn:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-rte__btn--active {
    background: var(--color-action-brand-default);
    color: var(--color-text-on-brand);
  }

  .cy-rte__btn--active:hover {
    background: var(--color-action-brand-hover);
    color: var(--color-text-on-brand);
  }

  .cy-rte__btn--wide {
    width: auto;
    padding: 0 var(--space-2, 0.5rem);
  }

  .cy-rte__dropdown {
    position: relative;
  }

  .cy-rte__dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 10;
    margin-top: var(--space-1, 0.25rem);
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md, 8px);
    box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.15));
    overflow: hidden;
    min-width: 140px;
  }

  .cy-rte__dropdown-item {
    display: block;
    width: 100%;
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    border: none;
    background: transparent;
    color: var(--color-text-primary);
    font-size: 0.8125rem;
    text-align: left;
    cursor: pointer;
    transition: background var(--transition-default, 0.15s ease);
  }

  .cy-rte__dropdown-item:hover {
    background: var(--color-surface-hover);
  }

  .cy-rte__editor {
    padding: var(--space-4, 1rem);
    outline: none;
    font-family: var(--font-body, sans-serif);
    font-size: 0.9375rem;
    line-height: 1.65;
    color: var(--color-text-primary);
    overflow-y: auto;
    transition: box-shadow var(--transition-default, 0.15s ease);
  }

  .cy-rte__editor:focus {
    box-shadow: inset 0 0 0 2px var(--color-action-brand-default);
  }

  .cy-rte__editor:empty::before {
    content: attr(data-placeholder);
    color: var(--color-text-secondary);
    opacity: 0.5;
    pointer-events: none;
  }

  /* Styled output inside editor */
  .cy-rte__editor :global(h1),
  .cy-rte__editor :global(h2),
  .cy-rte__editor :global(h3) {
    font-family: var(--font-display, sans-serif);
    color: var(--color-text-primary);
    margin: var(--space-3, 0.75rem) 0 var(--space-2, 0.5rem);
    line-height: 1.3;
  }

  .cy-rte__editor :global(h1) {
    font-size: 1.75rem;
    font-weight: var(--font-weight-bold, 700);
  }

  .cy-rte__editor :global(h2) {
    font-size: 1.375rem;
    font-weight: var(--font-weight-bold, 700);
  }

  .cy-rte__editor :global(h3) {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
  }

  .cy-rte__editor :global(p) {
    margin: 0 0 var(--space-2, 0.5rem);
    font-family: var(--font-body, sans-serif);
  }

  .cy-rte__editor :global(code),
  .cy-rte__editor :global(pre) {
    font-family: var(--font-mono, monospace);
    background: var(--color-surface-raised);
    border-radius: var(--radius-sm, 4px);
  }

  .cy-rte__editor :global(code) {
    padding: 0.1em 0.35em;
    font-size: 0.875em;
  }

  .cy-rte__editor :global(pre) {
    padding: var(--space-3, 0.75rem);
    overflow-x: auto;
    margin: var(--space-2, 0.5rem) 0;
  }

  .cy-rte__editor :global(blockquote) {
    border-left: 3px solid var(--color-action-brand-default);
    margin: var(--space-2, 0.5rem) 0;
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    color: var(--color-text-secondary);
    background: var(--color-surface-raised);
    border-radius: 0 var(--radius-sm, 4px) var(--radius-sm, 4px) 0;
  }

  .cy-rte__editor :global(a) {
    color: var(--color-action-brand-default);
    text-decoration: underline;
  }

  .cy-rte__editor :global(ul),
  .cy-rte__editor :global(ol) {
    margin: var(--space-2, 0.5rem) 0;
    padding-left: var(--space-5, 1.25rem);
  }

  .cy-rte__editor :global(li) {
    margin-bottom: var(--space-1, 0.25rem);
  }

  .cy-rte__editor :global(hr) {
    border: none;
    border-top: 1px solid var(--color-border-default);
    margin: var(--space-3, 0.75rem) 0;
  }

  .cy-rte--readonly .cy-rte__editor {
    cursor: default;
  }

  .cy-rte--readonly .cy-rte__editor:focus {
    box-shadow: none;
  }
</style>
