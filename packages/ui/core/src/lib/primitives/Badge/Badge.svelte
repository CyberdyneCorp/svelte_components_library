<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    variant = "neutral",
    size = "md",
    children,
  }: {
    variant?: "success" | "warning" | "error" | "info" | "neutral";
    size?: "sm" | "md";
    children?: Snippet;
  } = $props();
</script>

<span class="cy-badge cy-badge--{variant} cy-badge--{size}">
  {#if children}
    {@render children()}
  {/if}
</span>

<style>
  .cy-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-pill);
    font-family: var(--font-mono);
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.02em;
    white-space: nowrap;
    border: 1px solid transparent;
    transition: all var(--transition-default);
  }

  .cy-badge--sm {
    padding: 0.0625rem var(--space-2);
    font-size: 0.6875rem;
    height: 20px;
  }

  .cy-badge--md {
    padding: var(--space-1) var(--space-3);
    font-size: 0.75rem;
    height: 24px;
  }

  /* Success */
  .cy-badge--success {
    background: var(--color-state-success-bg);
    color: var(--color-state-success);
    border-color: rgba(0, 255, 65, 0.2);
    box-shadow: 0 0 8px rgba(0, 255, 65, 0.1);
  }

  /* Warning */
  .cy-badge--warning {
    background: var(--color-state-warning-bg);
    color: var(--color-state-warning);
    border-color: rgba(255, 184, 0, 0.2);
    box-shadow: 0 0 8px rgba(255, 184, 0, 0.1);
  }

  /* Error */
  .cy-badge--error {
    background: var(--color-state-error-bg);
    color: var(--color-state-error);
    border-color: rgba(255, 68, 68, 0.2);
    box-shadow: 0 0 8px rgba(255, 68, 68, 0.1);
  }

  /* Info */
  .cy-badge--info {
    background: var(--color-state-info-bg);
    color: var(--color-state-info);
    border-color: rgba(0, 212, 255, 0.2);
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.1);
  }

  /* Neutral */
  .cy-badge--neutral {
    background: var(--color-surface-raised);
    color: var(--color-text-secondary);
    border-color: var(--color-border-default);
  }
</style>
