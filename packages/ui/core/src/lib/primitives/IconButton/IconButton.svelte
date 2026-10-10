<svelte:options runes={true} />

<script lang="ts">
  import Icon from "../Icon/Icon.svelte";

  let {
    icon = "",
    label = "",
    variant = "ghost",
    size = "md",
    disabled = false,
    badge,
    badgeLabel,
    onclick,
  }: {
    /** `Icon` name to render. */
    icon: string;
    /** Accessible name of the button (there is no visible text). */
    label: string;
    variant?: "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    /** Optional count shown as a small bubble over the icon. Shown as-is; the application decides on "99+". */
    badge?: string | number;
    /** Visually hidden sentence appended to the accessible name when `badge` is set, e.g. "3 unread notifications". */
    badgeLabel?: string;
    onclick?: (e: MouseEvent) => void;
  } = $props();

  const iconSizes: Record<string, number> = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  let iconSize = $derived(iconSizes[size]);
  let hasBadge = $derived(badge !== undefined && badge !== null && badge !== "");
</script>

<!--
  Without a badge the button keeps its original `aria-label`. With one, the name is
  built from hidden text instead so it reads "<label> <badgeLabel>" to assistive tech.
-->
<button
  class="cy-icon-btn cy-icon-btn--{variant} cy-icon-btn--{size}"
  class:cy-icon-btn--badged={hasBadge}
  aria-label={hasBadge ? undefined : label}
  {disabled}
  {onclick}
  type="button"
>
  <Icon name={icon} size={iconSize} />
  {#if hasBadge}
    <span class="cy-icon-btn__sr-only">{label}</span>
    <span class="cy-icon-btn__badge" aria-hidden="true">{badge}</span>
    {#if badgeLabel}
      <span class="cy-icon-btn__sr-only">{badgeLabel}</span>
    {/if}
  {/if}
</button>

<style>
  .cy-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 50%;
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-default);
    outline: none;
    padding: 0;
  }

  .cy-icon-btn--badged {
    position: relative;
  }

  .cy-icon-btn:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-icon-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Sizes */
  .cy-icon-btn--sm {
    width: 28px;
    height: 28px;
  }

  .cy-icon-btn--md {
    width: 36px;
    height: 36px;
  }

  .cy-icon-btn--lg {
    width: 44px;
    height: 44px;
  }

  /* Ghost */
  .cy-icon-btn--ghost:hover:not(:disabled) {
    background: var(--btn-ghost-bg-hover);
    color: var(--btn-ghost-text-hover);
  }

  .cy-icon-btn--ghost:active:not(:disabled) {
    background: var(--color-surface-active);
  }

  /* Outline */
  .cy-icon-btn--outline {
    border-color: var(--color-border-default);
  }

  .cy-icon-btn--outline:hover:not(:disabled) {
    border-color: var(--color-border-strong);
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-icon-btn--outline:active:not(:disabled) {
    background: var(--color-surface-active);
  }

  /* Count badge. Inverse text on the filled danger bubble keeps >= 4.5:1 at 10px in the dark and light themes. */
  .cy-icon-btn__badge {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(25%, -25%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 1rem;
    height: 1rem;
    padding: 0 var(--space-1);
    border-radius: var(--radius-pill);
    border: var(--border-width-strong) var(--border-style) var(--color-surface-default);
    background: var(--color-action-danger-default);
    color: var(--color-text-inverse);
    font-family: var(--font-body);
    font-size: 0.625rem;
    font-weight: var(--font-weight-semibold);
    line-height: 1;
    pointer-events: none;
  }

  .cy-icon-btn--sm .cy-icon-btn__badge {
    transform: translate(35%, -35%);
  }

  .cy-icon-btn__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
</style>
