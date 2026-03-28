<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable(""),
    language = "typescript",
    label = "",
    placeholder = "",
    disabled = false,
    readonly = false,
    maxHeight = "400px",
    showLineNumbers = true,
    error = "",
  }: {
    value?: string;
    language?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    maxHeight?: string;
    showLineNumbers?: boolean;
    error?: string;
  } = $props();

  let textareaEl: HTMLTextAreaElement | undefined = $state(undefined);
  let scrollTop = $state(0);
  let scrollLeft = $state(0);

  let inputId = `cy-ce-${Math.random().toString(36).slice(2, 9)}`;

  let lines = $derived(value.split("\n"));
  let lineCount = $derived(lines.length);

  let highlighted = $derived.by(() => {
    return highlightCode(value, language);
  });

  function highlightCode(code: string, lang: string): string {
    let html = escapeHtml(code);

    // Comments
    if (lang === "solidity" || lang === "typescript" || lang === "javascript" || lang === "json") {
      html = html.replace(/(\/\/.*$)/gm, '<span class="cy-ce__hl-comment">$1</span>');
      html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="cy-ce__hl-comment">$1</span>');
    }

    // Strings
    html = html.replace(/(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;|`[^`]*?`)/g, '<span class="cy-ce__hl-string">$1</span>');

    // Numbers
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="cy-ce__hl-number">$1</span>');

    // Keywords
    const kwMap: Record<string, string[]> = {
      typescript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "interface", "type", "import", "export", "from", "async", "await", "new", "this", "extends", "implements", "enum", "default", "switch", "case", "break", "try", "catch", "throw", "finally", "of", "in", "as", "is"],
      javascript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export", "from", "async", "await", "new", "this", "extends", "default", "switch", "case", "break", "try", "catch", "throw", "finally", "of", "in"],
      solidity: ["pragma", "solidity", "contract", "function", "public", "private", "external", "internal", "view", "pure", "payable", "returns", "mapping", "address", "uint256", "uint", "int", "bool", "string", "bytes", "event", "emit", "modifier", "require", "msg", "memory", "storage", "calldata", "struct", "enum", "if", "else", "for", "while", "return", "import", "is"],
      json: [],
    };
    const keywords = kwMap[lang] || kwMap["typescript"];
    if (keywords.length > 0) {
      const kwRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
      html = html.replace(kwRegex, '<span class="cy-ce__hl-keyword">$1</span>');
    }

    return html;
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaEl!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      value = value.substring(0, start) + "  " + value.substring(end);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    } else if (e.key === "Enter") {
      const ta = textareaEl!;
      const start = ta.selectionStart;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const currentLine = value.substring(lineStart, start);
      const indent = currentLine.match(/^(\s*)/)?.[1] || "";
      e.preventDefault();
      const insertion = "\n" + indent;
      value = value.substring(0, start) + insertion + value.substring(ta.selectionEnd);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + insertion.length;
      });
    }
  }

  function handleScroll() {
    if (textareaEl) {
      scrollTop = textareaEl.scrollTop;
      scrollLeft = textareaEl.scrollLeft;
    }
  }
</script>

<div class="cy-ce" class:cy-ce--error={!!error} class:cy-ce--disabled={disabled}>
  {#if label}
    <div class="cy-ce__header">
      <label class="cy-ce__label" for={inputId}>{label}</label>
      <span class="cy-ce__lang">{language}</span>
    </div>
  {/if}

  <div class="cy-ce__editor" style="max-height: {maxHeight}">
    {#if showLineNumbers}
      <div class="cy-ce__gutter" style="transform: translateY(-{scrollTop}px)">
        {#each Array(lineCount) as _, i}
          <span class="cy-ce__line-num">{i + 1}</span>
        {/each}
      </div>
    {/if}

    <div class="cy-ce__code-area">
      <pre
        class="cy-ce__highlight"
        style="transform: translate(-{scrollLeft}px, -{scrollTop}px)"
        aria-hidden="true"
      >{@html highlighted}
</pre>
      <textarea
        class="cy-ce__textarea"
        id={inputId}
        bind:value
        bind:this={textareaEl}
        {placeholder}
        {disabled}
        {readonly}
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        onkeydown={handleKeydown}
        onscroll={handleScroll}
        aria-label={label || "Code editor"}
      ></textarea>
    </div>
  </div>

  {#if error}
    <p class="cy-ce__error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-ce {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
  }

  .cy-ce__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cy-ce__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-ce__lang {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-action-secondary-default);
    background: var(--color-state-info-bg);
    border: 1px solid var(--color-state-info-bg);
    border-radius: var(--radius-sm);
    padding: 1px 6px;
    text-transform: lowercase;
  }

  .cy-ce__editor {
    display: flex;
    background: var(--color-bg-primary);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: border-color var(--transition-default);
  }

  .cy-ce__editor:focus-within {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-ce--error .cy-ce__editor {
    border-color: var(--input-border-error);
  }

  .cy-ce--disabled .cy-ce__editor {
    opacity: 0.5;
  }

  .cy-ce__gutter {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: var(--space-3) 0;
    padding-right: var(--space-2);
    padding-left: var(--space-2);
    border-right: 1px solid var(--input-border);
    background: var(--color-surface-raised);
    user-select: none;
    flex-shrink: 0;
    overflow: hidden;
  }

  .cy-ce__line-num {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    line-height: 1.5rem;
    color: var(--color-text-tertiary);
    min-width: 2ch;
    text-align: right;
  }

  .cy-ce__code-area {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .cy-ce__highlight {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: var(--space-3);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.5rem;
    color: var(--color-text-secondary);
    white-space: pre;
    pointer-events: none;
    min-width: 100%;
  }

  .cy-ce__textarea {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 120px;
    margin: 0;
    padding: var(--space-3);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.5rem;
    color: transparent;
    caret-color: var(--color-action-brand-default);
    background: transparent;
    border: none;
    outline: none;
    resize: vertical;
    overflow: auto;
    white-space: pre;
    tab-size: 2;
  }

  .cy-ce__textarea::placeholder {
    color: var(--input-placeholder);
  }

  :global(.cy-ce__hl-keyword) {
    color: var(--color-action-secondary-default);
  }

  :global(.cy-ce__hl-string) {
    color: var(--color-action-brand-default);
  }

  :global(.cy-ce__hl-number) {
    color: var(--color-action-tertiary-default);
  }

  :global(.cy-ce__hl-comment) {
    color: var(--color-text-tertiary);
    font-style: italic;
  }

  .cy-ce__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
