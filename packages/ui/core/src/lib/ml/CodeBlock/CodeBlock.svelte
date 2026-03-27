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
    background: var(--color-surface-elevated, #12121a);
    border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 0.875rem;
  }

  .cy-code__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2, 8px) var(--space-4, 16px);
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
  }

  .cy-code__lang {
    color: var(--color-text-muted, rgba(255, 255, 255, 0.5));
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cy-code__copy {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-sm, 6px);
    color: var(--color-text-muted, rgba(255, 255, 255, 0.5));
    font-family: var(--font-body, inherit);
    font-size: 0.75rem;
    padding: var(--space-1, 4px) var(--space-2, 8px);
    cursor: pointer;
    transition: all var(--transition-default, 150ms ease);
  }

  .cy-code__copy:hover {
    color: var(--color-brand, #00ff41);
    border-color: var(--color-brand, #00ff41);
    background: rgba(0, 255, 65, 0.08);
  }

  .cy-code__body {
    overflow: auto;
    padding: var(--space-4, 16px);
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
    margin-right: var(--space-4, 16px);
    color: var(--color-text-muted, rgba(255, 255, 255, 0.25));
    text-align: right;
    user-select: none;
    flex-shrink: 0;
  }

  .cy-code__content {
    color: var(--color-text-default, rgba(255, 255, 255, 0.87));
    white-space: pre;
  }

  :global(.cy-code__keyword) {
    color: var(--color-secondary, #00d4ff);
  }

  :global(.cy-code__string) {
    color: var(--color-brand, #00ff41);
  }

  :global(.cy-code__number) {
    color: #bd93f9;
  }

  :global(.cy-code__comment) {
    color: rgba(255, 255, 255, 0.35);
    font-style: italic;
  }
</style>
