<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    label = "",
    value = "",
    change,
    changeLabel = "",
    icon,
    variant = "default",
  }: {
    label: string;
    value: string;
    change?: number;
    changeLabel?: string;
    icon?: Snippet;
    variant?: "default" | "brand" | "info" | "warning";
  } = $props();

  let changeClass = $derived(
    change === undefined ? "" : change >= 0 ? "positive" : "negative"
  );

  let changeFormatted = $derived(
    change === undefined
      ? ""
      : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`
  );

  let arrow = $derived(
    change === undefined ? "" : change >= 0 ? "\u25B2" : "\u25BC"
  );
</script>

<div class="cy-metric cy-metric--{variant}">
  <div class="cy-metric__header">
    <span class="cy-metric__label">{label}</span>
    {#if icon}
      <span class="cy-metric__icon">
        {@render icon()}
      </span>
    {/if}
  </div>
  <div class="cy-metric__value">{value}</div>
  {#if change !== undefined}
    <div class="cy-metric__footer">
      <span class="cy-metric__change cy-metric__change--{changeClass}">
        <span class="cy-metric__arrow">{arrow}</span>
        {changeFormatted}
      </span>
      {#if changeLabel}
        <span class="cy-metric__change-label">{changeLabel}</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .cy-metric {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg, 12px);
    padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
    transition: all var(--transition-default, 0.2s ease);
  }

  .cy-metric:hover {
    border-color: var(--color-border-default);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-metric--brand {
    border-left: 3px solid var(--color-action-brand-default);
  }

  .cy-metric--info {
    border-left: 3px solid var(--color-action-secondary-default);
  }

  .cy-metric--warning {
    border-left: 3px solid var(--color-state-warning);
  }

  .cy-metric__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2, 0.5rem);
  }

  .cy-metric__label {
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .cy-metric__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    width: 20px;
    height: 20px;
  }

  .cy-metric__value {
    font-family: var(--font-mono, monospace);
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .cy-metric__footer {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    margin-top: var(--space-3, 0.75rem);
  }

  .cy-metric__change {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-metric__change--positive {
    color: var(--color-state-success);
  }

  .cy-metric__change--negative {
    color: var(--color-state-error);
  }

  .cy-metric__arrow {
    font-size: 0.5625rem;
  }

  .cy-metric__change-label {
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
  }
</style>
