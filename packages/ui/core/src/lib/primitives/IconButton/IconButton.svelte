<svelte:options runes={true} />

<script lang="ts">
  import Icon from "../Icon/Icon.svelte";

  let {
    icon = "",
    label = "",
    variant = "ghost",
    size = "md",
    disabled = false,
    onclick,
  }: {
    icon: string;
    label: string;
    variant?: "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
  } = $props();

  const iconSizes: Record<string, number> = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  let iconSize = $derived(iconSizes[size]);
</script>

<button
  class="cy-icon-btn cy-icon-btn--{variant} cy-icon-btn--{size}"
  aria-label={label}
  {disabled}
  {onclick}
  type="button"
>
  <Icon name={icon} size={iconSize} />
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
</style>
