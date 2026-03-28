<svelte:options runes={true} />

<script lang="ts">
  let {
    code = "",
    language = "typescript",
    showLineNumbers = true,
    copyable = true,
    maxHeight,
  }: {
    code?: string;
    language?: string;
    showLineNumbers?: boolean;
    copyable?: boolean;
    maxHeight?: string;
  } = $props();

  let copied = $state(false);

  const lines = $derived(code.split("\n"));

  function highlight(text: string, lang: string): string {
    let result = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Comments
    result = result.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
      '<span class="cy-code__comment">$1</span>'
    );

    // Strings
    result = result.replace(
      /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
      '<span class="cy-code__string">$1</span>'
    );

    // Numbers
    result = result.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="cy-code__number">$1</span>'
    );

    // Keywords based on language
    const keywords =
      lang === "python"
        ? "def|class|import|from|return|if|elif|else|for|while|try|except|finally|with|as|in|not|and|or|is|None|True|False|pass|break|continue|raise|yield|async|await|lambda"
        : lang === "json"
          ? "true|false|null"
          : "const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|default|from|new|this|typeof|instanceof|void|null|undefined|true|false|async|await|try|catch|finally|throw|interface|type|enum|implements|abstract|private|public|protected|static|readonly";

    result = result.replace(
      new RegExp(`\\b(${keywords})\\b`, "g"),
      '<span class="cy-code__keyword">$1</span>'
    );

    return result;
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // Clipboard API not available
    }
  }
</script>

<div class="cy-code" style:max-height={maxHeight}>
  <div class="cy-code__header">
    <span class="cy-code__lang">{language}</span>
    {#if copyable}
      <button class="cy-code__copy" onclick={copyCode} aria-label="Copy code">
        {copied ? "Copied!" : "Copy"}
      </button>
    {/if}
  </div>
  <div class="cy-code__body">
    <pre><code>{#each lines as line, i}<span class="cy-code__line">{#if showLineNumbers}<span class="cy-code__gutter">{i + 1}</span>{/if}<span class="cy-code__content">{@html highlight(line, language)}</span></span>
{/each}</code></pre>
  </div>
</div>

<style>
  .cy-code {
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    overflow: hidden;
    font-family: var(--font-mono);
    font-size: 0.875rem;
  }

  .cy-code__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-4);
    background: var(--color-surface-hover);
    border-bottom: 1px solid var(--color-border-default);
  }

  .cy-code__lang {
    color: var(--color-text-tertiary);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cy-code__copy {
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-sm);
    color: var(--color-text-tertiary);
    font-family: var(--font-body);
    font-size: 0.75rem;
    padding: var(--space-1) var(--space-2);
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-code__copy:hover {
    color: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
  }

  .cy-code__body {
    overflow: auto;
    padding: var(--space-4);
  }

  pre {
    margin: 0;
    padding: 0;
  }

  code {
    display: block;
  }

  .cy-code__line {
    display: flex;
    line-height: 1.7;
  }

  .cy-code__gutter {
    display: inline-block;
    min-width: 3ch;
    margin-right: var(--space-4);
    color: var(--color-text-tertiary);
    text-align: right;
    user-select: none;
    flex-shrink: 0;
  }

  .cy-code__content {
    color: var(--color-text-primary);
    white-space: pre;
  }

  :global(.cy-code__keyword) {
    color: var(--color-action-secondary-default);
  }

  :global(.cy-code__string) {
    color: var(--color-action-brand-default);
  }

  :global(.cy-code__number) {
    color: var(--color-syntax-number);
  }

  :global(.cy-code__comment) {
    color: var(--color-text-tertiary);
    font-style: italic;
  }
</style>
