<svelte:options runes={true} />

<script lang="ts">
  let {
    textarea = $bindable(null),
    oninsert,
    disabled = false,
  }: {
    textarea?: HTMLTextAreaElement | null;
    oninsert?: (text: string, selectionStart: number, selectionEnd: number) => void;
    disabled?: boolean;
  } = $props();

  let showHeadingDropdown = $state(false);

  function insertMarkdown(before: string, after: string, defaultText: string) {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const text = selected || defaultText;
    const insertion = before + text + after;

    const newValue = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
    textarea.value = newValue;

    // Trigger input event so Svelte bindings update
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    // Set selection to the inserted text (excluding before/after markers)
    const newStart = start + before.length;
    const newEnd = newStart + text.length;
    textarea.setSelectionRange(newStart, newEnd);
    textarea.focus();

    oninsert?.(newValue, newStart, newEnd);
  }

  function insertLine(prefix: string, defaultText: string) {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const value = textarea.value;

    // Find start of current line
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const beforeLine = value.substring(0, lineStart);
    const afterCursor = value.substring(start);
    const currentLineBeforeCursor = value.substring(lineStart, start);

    const text = currentLineBeforeCursor || defaultText;
    const insertion = prefix + text;
    const newValue = beforeLine + insertion + afterCursor;

    textarea.value = newValue;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    const newStart = lineStart + prefix.length;
    const newEnd = newStart + text.length;
    textarea.setSelectionRange(newStart, newEnd);
    textarea.focus();

    oninsert?.(newValue, newStart, newEnd);
  }

  function insertBlock(text: string) {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Ensure we're on a new line
    const needsNewline = start > 0 && textarea.value[start - 1] !== "\n";
    const prefix = needsNewline ? "\n\n" : (start > 0 ? "\n" : "");
    const insertion = prefix + text + "\n";

    const newValue = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
    textarea.value = newValue;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    const newPos = start + insertion.length;
    textarea.setSelectionRange(newPos, newPos);
    textarea.focus();

    oninsert?.(newValue, newPos, newPos);
  }

  function handleHeading(level: number) {
    const prefix = "#".repeat(level) + " ";
    insertLine(prefix, "Heading");
    showHeadingDropdown = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;

    if (e.key === "b") {
      e.preventDefault();
      insertMarkdown("**", "**", "bold text");
    } else if (e.key === "i") {
      e.preventDefault();
      insertMarkdown("*", "*", "italic text");
    } else if (e.key === "k") {
      e.preventDefault();
      insertMarkdown("[", "](url)", "link text");
    }
  }

  $effect(() => {
    const el = textarea;
    if (!el) return;
    el.addEventListener("keydown", handleKeydown);
    return () => el.removeEventListener("keydown", handleKeydown);
  });

  // Close heading dropdown on outside click
  function handleWindowClick() {
    showHeadingDropdown = false;
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="cy-md-toolbar" class:cy-md-toolbar--disabled={disabled}>
  <!-- Bold -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Bold (Ctrl+B)"
    {disabled}
    onclick={() => insertMarkdown("**", "**", "bold text")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  </button>

  <!-- Italic -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Italic (Ctrl+I)"
    {disabled}
    onclick={() => insertMarkdown("*", "*", "italic text")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  </button>

  <!-- Strikethrough -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Strikethrough"
    {disabled}
    onclick={() => insertMarkdown("~~", "~~", "strikethrough")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.3 4.9c-1.7-1.4-4.2-1.7-6.3-.9A5.4 5.4 0 0 0 8 8.4c0 .8.2 1.5.5 2.1" /><path d="M4 12h16" /><path d="M6.7 19.1c1.7 1.4 4.2 1.7 6.3.9a5.4 5.4 0 0 0 3-4.4c0-.8-.2-1.5-.5-2.1" />
    </svg>
  </button>

  <div class="cy-md-toolbar__sep"></div>

  <!-- Heading dropdown -->
  <div class="cy-md-toolbar__dropdown-wrap">
    <button
      type="button"
      class="cy-md-toolbar__btn"
      title="Heading"
      {disabled}
      onclick={(e) => { e.stopPropagation(); showHeadingDropdown = !showHeadingDropdown; }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="M17 12l3-2v8" />
      </svg>
    </button>
    {#if showHeadingDropdown}
      <div class="cy-md-toolbar__dropdown" onclick={(e) => e.stopPropagation()}>
        <button type="button" onclick={() => handleHeading(1)}>H1</button>
        <button type="button" onclick={() => handleHeading(2)}>H2</button>
        <button type="button" onclick={() => handleHeading(3)}>H3</button>
        <button type="button" onclick={() => handleHeading(4)}>H4</button>
      </div>
    {/if}
  </div>

  <div class="cy-md-toolbar__sep"></div>

  <!-- Link -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Link (Ctrl+K)"
    {disabled}
    onclick={() => insertMarkdown("[", "](url)", "link text")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  </button>

  <!-- Image -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Image"
    {disabled}
    onclick={() => insertMarkdown("![", "](image-url)", "alt text")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  </button>

  <div class="cy-md-toolbar__sep"></div>

  <!-- Code inline -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Inline code"
    {disabled}
    onclick={() => insertMarkdown("`", "`", "code")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  </button>

  <!-- Code block -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Code block"
    {disabled}
    onclick={() => insertBlock("```\ncode here\n```")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><polyline points="9 8 5 12 9 16" /><polyline points="15 8 19 12 15 16" />
    </svg>
  </button>

  <div class="cy-md-toolbar__sep"></div>

  <!-- Blockquote -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Blockquote"
    {disabled}
    onclick={() => insertLine("> ", "quote")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.68 11 13.166 11 15c0 1.933-1.567 3.5-3.5 3.5-1.294 0-2.442-.607-2.917-1.179zM14.583 17.321C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.68 21 13.166 21 15c0 1.933-1.567 3.5-3.5 3.5-1.294 0-2.442-.607-2.917-1.179z" />
    </svg>
  </button>

  <!-- Unordered list -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Unordered list"
    {disabled}
    onclick={() => insertLine("- ", "list item")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  </button>

  <!-- Ordered list -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Ordered list"
    {disabled}
    onclick={() => insertLine("1. ", "list item")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><text x="2" y="8" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif">1</text><text x="2" y="14" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif">2</text><text x="2" y="20" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif">3</text>
    </svg>
  </button>

  <!-- Task list -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Task list"
    {disabled}
    onclick={() => insertLine("- [ ] ", "task")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="6" height="6" rx="1" /><path d="M5 11l1.5 1.5L9 9" /><line x1="12" y1="8" x2="21" y2="8" /><rect x="3" y="14" width="6" height="6" rx="1" /><line x1="12" y1="17" x2="21" y2="17" />
    </svg>
  </button>

  <div class="cy-md-toolbar__sep"></div>

  <!-- Horizontal rule -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Horizontal rule"
    {disabled}
    onclick={() => insertBlock("---")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  </button>

  <!-- Table -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Table"
    {disabled}
    onclick={() => insertBlock("| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n| Cell 7   | Cell 8   | Cell 9   |")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  </button>

  <!-- Mermaid -->
  <button
    type="button"
    class="cy-md-toolbar__btn"
    title="Mermaid diagram"
    {disabled}
    onclick={() => insertBlock("```mermaid\nflowchart TD\n    A[Start] --> B[Process]\n    B --> C{Decision}\n    C -->|Yes| D[End]\n    C -->|No| B\n```")}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><line x1="12" y1="7" x2="5" y2="17" /><line x1="12" y1="7" x2="19" y2="17" />
    </svg>
  </button>
</div>

<style>
  .cy-md-toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 6px 8px;
    background: #0a0a0f;
    border-bottom: 1px solid rgba(0, 255, 65, 0.1);
    flex-wrap: wrap;
  }

  .cy-md-toolbar--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .cy-md-toolbar__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    color: var(--color-text-secondary, #a0a0b0);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .cy-md-toolbar__btn:hover {
    color: #00ff41;
    background: rgba(0, 255, 65, 0.08);
    border-color: rgba(0, 255, 65, 0.2);
  }

  .cy-md-toolbar__btn:active {
    color: #00ff41;
    background: rgba(0, 255, 65, 0.15);
  }

  .cy-md-toolbar__sep {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.08);
    margin: 0 4px;
  }

  .cy-md-toolbar__dropdown-wrap {
    position: relative;
  }

  .cy-md-toolbar__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: #12121a;
    border: 1px solid rgba(0, 255, 65, 0.2);
    border-radius: 6px;
    padding: 4px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .cy-md-toolbar__dropdown button {
    display: block;
    width: 100%;
    padding: 6px 16px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--color-text-secondary, #a0a0b0);
    font-family: var(--font-display, "Orbitron", sans-serif);
    font-size: 0.75rem;
    cursor: pointer;
    text-align: left;
    transition: all 150ms ease;
  }

  .cy-md-toolbar__dropdown button:hover {
    color: #00ff41;
    background: rgba(0, 255, 65, 0.08);
  }
</style>
