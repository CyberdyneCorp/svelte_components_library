<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    variant = "brand",
    size = "md",
    disabled = false,
    loading = false,
    type = "button",
    onclick,
    children,
  }: {
    variant?: "brand" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "submit" | "reset";
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  } = $props();

  let isDisabled = $derived(disabled || loading);
</script>

<button
  class="cy-btn cy-btn--{variant} cy-btn--{size}"
  class:cy-btn--loading={loading}
  {type}
  disabled={isDisabled}
  aria-disabled={isDisabled}
  aria-busy={loading}
  {onclick}
>
  {#if loading}
    <span class="cy-btn__spinner" aria-hidden="true"></span>
  {/if}
  <span class="cy-btn__content" class:cy-btn__content--hidden={loading}>
    {#if children}
      {@render children()}
    {/if}
  </span>
</button>

<style>
  .cy-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    position: relative;
    transition: all var(--transition-default);
    outline: none;
    white-space: nowrap;
    text-decoration: none;
    -webkit-user-select: none;
    user-select: none;
  }

  .cy-btn:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Sizes */
  .cy-btn--sm {
    padding: var(--space-1) var(--space-3);
    font-size: 0.8125rem;
    height: 32px;
  }

  .cy-btn--md {
    padding: var(--space-2) var(--space-4);
    font-size: 0.875rem;
    height: 40px;
  }

  .cy-btn--lg {
    padding: var(--space-3) var(--space-6);
    font-size: 1rem;
    height: 48px;
  }

  /* Brand */
  .cy-btn--brand {
    background: var(--btn-brand-bg);
    color: var(--btn-brand-text);
    border-color: var(--btn-brand-bg);
  }

  .cy-btn--brand:hover:not(:disabled) {
    background: var(--btn-brand-bg-hover);
    border-color: var(--btn-brand-bg-hover);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-btn--brand:active:not(:disabled) {
    background: var(--btn-brand-bg-active);
    border-color: var(--btn-brand-bg-active);
  }

  /* Secondary */
  .cy-btn--secondary {
    background: var(--btn-secondary-bg);
    color: var(--btn-secondary-text);
    border-color: var(--btn-secondary-border);
  }

  .cy-btn--secondary:hover:not(:disabled) {
    background: var(--btn-secondary-bg-hover);
    border-color: var(--color-border-strong);
  }

  .cy-btn--secondary:active:not(:disabled) {
    background: var(--color-surface-active);
  }

  /* Outline */
  .cy-btn--outline {
    background: transparent;
    color: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
  }

  .cy-btn--outline:hover:not(:disabled) {
    background: var(--color-surface-hover);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-btn--outline:active:not(:disabled) {
    background: var(--color-surface-active);
  }

  /* Ghost */
  .cy-btn--ghost {
    background: transparent;
    color: var(--btn-ghost-text);
    border-color: transparent;
  }

  .cy-btn--ghost:hover:not(:disabled) {
    background: var(--btn-ghost-bg-hover);
    color: var(--btn-ghost-text-hover);
  }

  .cy-btn--ghost:active:not(:disabled) {
    background: var(--color-surface-active);
  }

  /* Danger */
  .cy-btn--danger {
    background: var(--btn-danger-bg);
    color: var(--btn-danger-text);
    border-color: var(--btn-danger-bg);
  }

  .cy-btn--danger:hover:not(:disabled) {
    background: var(--btn-danger-bg-hover);
    border-color: var(--btn-danger-bg-hover);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-btn--danger:active:not(:disabled) {
    background: var(--primitive-red-30);
    border-color: var(--primitive-red-30);
  }

  /* Loading spinner */
  .cy-btn__spinner {
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: cy-spinner 0.6s linear infinite;
  }

  .cy-btn__content--hidden {
    visibility: hidden;
  }

  @keyframes cy-spinner {
    to {
      transform: rotate(360deg);
    }
  }
</style>
