<svelte:options runes={true} />

<script lang="ts">
  let {
    value = 0,
    variant = "brand",
    size = "md",
    showLabel = false,
  }: {
    value?: number;
    variant?: "brand" | "info" | "warning" | "error";
    size?: "sm" | "md";
    showLabel?: boolean;
  } = $props();

  let clampedValue = $derived(Math.min(100, Math.max(0, value)));
</script>

<div class="cy-progress cy-progress--{size}">
  <div class="cy-progress__track">
    <div
      class="cy-progress__fill cy-progress__fill--{variant}"
      style="width: {clampedValue}%"
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    ></div>
  </div>
  {#if showLabel}
    <span class="cy-progress__label">{clampedValue}%</span>
  {/if}
</div>

<style>
  .cy-progress {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-family: var(--font-mono);
  }

  .cy-progress__track {
    flex: 1;
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-pill);
    overflow: hidden;
    border: 1px solid var(--color-border-subtle);
  }

  .cy-progress--sm .cy-progress__track {
    height: 4px;
  }

  .cy-progress--md .cy-progress__track {
    height: 8px;
  }

  .cy-progress__fill {
    height: 100%;
    border-radius: var(--radius-pill);
    transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cy-progress__fill--brand {
    background: var(--color-action-brand-default);
    box-shadow: 0 0 8px rgba(0, 255, 65, 0.4);
  }

  .cy-progress__fill--info {
    background: var(--color-state-info);
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
  }

  .cy-progress__fill--warning {
    background: var(--color-state-warning);
    box-shadow: 0 0 8px rgba(255, 184, 0, 0.3);
  }

  .cy-progress__fill--error {
    background: var(--color-state-error);
    box-shadow: 0 0 8px rgba(255, 68, 68, 0.3);
  }

  .cy-progress__label {
    flex-shrink: 0;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    min-width: 3ch;
    text-align: right;
  }
</style>
