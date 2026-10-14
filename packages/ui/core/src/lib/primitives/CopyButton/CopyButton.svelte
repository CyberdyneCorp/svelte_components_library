<svelte:options runes={true} />

<script lang="ts">
  let {
    text = "",
    label = "Copy",
    size = "md",
    variant = "ghost",
    iconOnly = false,
    copiedLabel,
  }: {
    text: string;
    label?: string;
    size?: "sm" | "md";
    variant?: "ghost" | "outline";
    /** Hide the visible text; `label` stays the accessible name and tooltip. */
    iconOnly?: boolean;
    /** Text shown and announced after a successful copy (i18n). Defaults to "Copied!" shown, "Copied" announced. */
    copiedLabel?: string;
  } = $props();

  let copied = $state(false);
  let copiedName = $derived(copiedLabel ?? "Copied");
  let copiedText = $derived(copiedLabel ?? "Copied!");
  let timeout: ReturnType<typeof setTimeout> | undefined;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        copied = false;
      }, 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      copied = true;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        copied = false;
      }, 2000);
    }
  }
</script>

<button
  class="cy-copy cy-copy--{variant} cy-copy--{size}"
  class:cy-copy--copied={copied}
  class:cy-copy--icon-only={iconOnly}
  onclick={handleCopy}
  aria-label={copied ? copiedName : label}
  title={copied ? copiedText : label}
>
  {#if copied}
    <svg class="cy-copy__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    {#if !iconOnly}<span class="cy-copy__label">{copiedText}</span>{/if}
  {:else}
    <svg class="cy-copy__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
    {#if !iconOnly}<span class="cy-copy__label">{label}</span>{/if}
  {/if}
</button>

<style>
  .cy-copy {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
    color: var(--color-text-tertiary);
  }

  .cy-copy:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  /* Sizes */
  .cy-copy--sm {
    padding: var(--space-1) var(--space-2);
    font-size: 0.75rem;
  }

  .cy-copy--md {
    padding: var(--space-1) var(--space-3);
    font-size: 0.8125rem;
  }

  /* Ghost */
  .cy-copy--ghost {
    background: transparent;
    border: none;
  }

  .cy-copy--ghost:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  /* Outline */
  .cy-copy--outline {
    background: transparent;
    border: 1px solid var(--color-border-default);
  }

  .cy-copy--outline:hover {
    border-color: var(--color-border-default);
    color: var(--color-text-primary);
  }

  /* Copied state */
  .cy-copy--copied {
    color: var(--color-action-brand-default);
  }

  .cy-copy--copied.cy-copy--ghost:hover {
    color: var(--color-action-brand-default);
  }

  .cy-copy--copied.cy-copy--outline {
    border-color: var(--color-action-brand-default);
  }

  .cy-copy--icon-only {
    padding: var(--space-1);
  }

  .cy-copy__icon {
    flex-shrink: 0;
  }

  .cy-copy__label {
    line-height: 1;
  }

  .cy-copy--sm .cy-copy__icon {
    width: 14px;
    height: 14px;
  }
</style>
