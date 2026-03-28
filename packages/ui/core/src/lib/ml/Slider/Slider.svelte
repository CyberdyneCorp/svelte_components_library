<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable(50),
    min = 0,
    max = 100,
    step = 1,
    label,
    showValue = true,
    disabled = false,
    unit = "",
  }: {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    showValue?: boolean;
    disabled?: boolean;
    unit?: string;
  } = $props();

  const fillPercent = $derived(((value - min) / (max - min)) * 100);
</script>

<div class="cy-slider" class:cy-slider--disabled={disabled}>
  {#if label || showValue}
    <div class="cy-slider__header">
      {#if label}
        <label class="cy-slider__label">{label}</label>
      {/if}
      {#if showValue}
        <span class="cy-slider__value">{value}{unit}</span>
      {/if}
    </div>
  {/if}
  <div class="cy-slider__track-wrapper">
    <input
      type="range"
      class="cy-slider__input"
      bind:value
      {min}
      {max}
      {step}
      {disabled}
      style:--fill-percent="{fillPercent}%"
    />
  </div>
</div>

<style>
  .cy-slider {
    width: 100%;
  }

  .cy-slider--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .cy-slider__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2, 8px);
  }

  .cy-slider__label {
    color: var(--color-text-primary);
    font-family: var(--font-body, inherit);
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-slider__value {
    color: var(--color-action-brand-default);
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-slider__track-wrapper {
    position: relative;
    width: 100%;
  }

  .cy-slider__input {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    background: linear-gradient(
      to right,
      var(--color-action-brand-default) 0%,
      var(--color-action-brand-default) var(--fill-percent, 50%),
      var(--color-border-subtle) var(--fill-percent, 50%),
      var(--color-border-subtle) 100%
    );
  }

  .cy-slider__input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-bg-primary);
    border: 2px solid var(--color-action-brand-default);
    cursor: pointer;
    transition: box-shadow var(--transition-default, 150ms ease);
  }

  .cy-slider__input::-webkit-slider-thumb:hover {
    box-shadow: var(--shadow-glow-green);
  }

  .cy-slider__input::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-bg-primary);
    border: 2px solid var(--color-action-brand-default);
    cursor: pointer;
    transition: box-shadow var(--transition-default, 150ms ease);
  }

  .cy-slider__input::-moz-range-thumb:hover {
    box-shadow: var(--shadow-glow-green);
  }

  .cy-slider__input:focus-visible {
    outline: 2px solid var(--color-action-brand-default);
    outline-offset: 4px;
    border-radius: 3px;
  }
</style>
