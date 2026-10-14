<svelte:options runes={true} />

<script lang="ts">
  import CopyButton from "../../primitives/CopyButton/CopyButton.svelte";

  let {
    value,
    visibleEnd = 4,
    maskLength = 8,
    maskChar = "•",
    label = "",
    revealable = false,
    revealed = $bindable(false),
    copyable = false,
    autoHideAfter,
    showLabel = "Show",
    hideLabel = "Hide",
    copyLabel,
    hiddenText = (end: string) => (end ? `ending in ${end}` : "hidden"),
  }: {
    /** The secret. While hidden it is never written to the DOM. */
    value: string;
    /** Trailing characters shown after the mask. Hidden when they would be half the value or more. */
    visibleEnd?: number;
    /** Number of mask characters; fixed so the secret's length does not leak. */
    maskLength?: number;
    /** Character used for the mask. */
    maskChar?: string;
    /** What the value is, e.g. "API key"; used in the button names. */
    label?: string;
    /** Show a toggle that reveals the full value. */
    revealable?: boolean;
    /** Whether the full value is shown. */
    revealed?: boolean;
    /** Show a copy button; it copies the full value even while hidden. */
    copyable?: boolean;
    /** Re-mask this many ms after a reveal. */
    autoHideAfter?: number;
    /** Verb for the reveal toggle (i18n). */
    showLabel?: string;
    /** Verb for the toggle's tooltip while revealed (i18n); the accessible name stays `showLabel`. */
    hideLabel?: string;
    /** Accessible name of the copy button. Defaults to "Copy <label>" or "Copy". */
    copyLabel?: string;
    /** Screen-reader text for the masked state, given the visible trailing characters (i18n). */
    hiddenText?: (end: string) => string;
  } = $props();

  let end = $derived(
    visibleEnd > 0 && visibleEnd * 2 < value.length ? value.slice(-visibleEnd) : "",
  );
  let mask = $derived(maskChar.repeat(Math.max(0, maskLength)));
  // A toggle keeps one name; `aria-pressed` carries the state. The tooltip names the next action.
  let toggleName = $derived(`${showLabel}${label ? ` ${label}` : ""}`);
  let toggleTitle = $derived(`${revealed ? hideLabel : showLabel}${label ? ` ${label}` : ""}`);
  let copyName = $derived(copyLabel ?? (label ? `Copy ${label}` : "Copy"));

  $effect(() => {
    if (!revealed || !autoHideAfter) return;
    const timer = setTimeout(() => (revealed = false), autoHideAfter);
    return () => clearTimeout(timer);
  });
</script>

<span class="cy-masked-value">
  {#if revealed}
    <span class="cy-masked-value__text">{value}</span>
  {:else}
    <span class="cy-masked-value__text" aria-hidden="true"
      ><span class="cy-masked-value__mask">{mask}</span>{end}</span
    >
    <span class="cy-masked-value__sr">{hiddenText(end)}</span>
  {/if}
  {#if revealable}
    <button
      type="button"
      class="cy-masked-value__toggle"
      aria-pressed={revealed}
      aria-label={toggleName}
      title={toggleTitle}
      onclick={() => (revealed = !revealed)}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
        {#if revealed}<line x1="3" y1="3" x2="21" y2="21" />{/if}
      </svg>
    </button>
  {/if}
  {#if copyable}
    <CopyButton text={value} label={copyName} size="sm" iconOnly />
  {/if}
</span>

<style>
  .cy-masked-value {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    max-width: 100%;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-text-primary);
    vertical-align: middle;
  }

  .cy-masked-value__text {
    overflow-wrap: anywhere;
  }

  .cy-masked-value__mask {
    letter-spacing: 0.1em;
    color: var(--color-text-secondary);
  }

  .cy-masked-value__toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-1);
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .cy-masked-value__toggle:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-masked-value__toggle:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-masked-value__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
