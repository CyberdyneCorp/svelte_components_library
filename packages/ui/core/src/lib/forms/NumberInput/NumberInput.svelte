<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable(0),
    label = "",
    min = -Infinity,
    max = Infinity,
    step = 1,
    precision = 0,
    disabled = false,
    error = "",
    unit = "",
    size = "md",
  }: {
    value?: number;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    disabled?: boolean;
    error?: string;
    unit?: string;
    size?: "sm" | "md";
  } = $props();

  let inputId = `cy-ni-${Math.random().toString(36).slice(2, 9)}`;

  function clamp(v: number): number {
    return Math.min(max, Math.max(min, v));
  }

  function format(v: number): string {
    return v.toFixed(precision);
  }

  function increment() {
    if (disabled) return;
    value = clamp(parseFloat((value + step).toFixed(precision)));
  }

  function decrement() {
    if (disabled) return;
    value = clamp(parseFloat((value - step).toFixed(precision)));
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const parsed = parseFloat(target.value);
    if (!isNaN(parsed)) {
      value = clamp(parseFloat(parsed.toFixed(precision)));
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      increment();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      decrement();
    }
  }
</script>

<div class="cy-ni cy-ni--{size}" class:cy-ni--error={!!error} class:cy-ni--disabled={disabled}>
  {#if label}
    <label class="cy-ni__label" for={inputId}>{label}</label>
  {/if}

  <div class="cy-ni__control">
    <button class="cy-ni__btn cy-ni__btn--dec" type="button" onclick={decrement} {disabled} aria-label="Decrease" tabindex={-1}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /></svg>
    </button>
    <div class="cy-ni__field-wrapper">
      <input
        class="cy-ni__field"
        id={inputId}
        type="text"
        inputmode="decimal"
        value={format(value)}
        {disabled}
        oninput={handleInput}
        onkeydown={handleKeydown}
        aria-invalid={!!error}
      />
      {#if unit}
        <span class="cy-ni__unit">{unit}</span>
      {/if}
    </div>
    <button class="cy-ni__btn cy-ni__btn--inc" type="button" onclick={increment} {disabled} aria-label="Increase" tabindex={-1}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
    </button>
  </div>

  {#if error}
    <p class="cy-ni__error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-ni {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
  }

  .cy-ni__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-ni__control {
    display: flex;
    align-items: stretch;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: all var(--transition-default);
  }

  .cy-ni__control:focus-within {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-ni--error .cy-ni__control {
    border-color: var(--input-border-error);
  }

  .cy-ni--disabled .cy-ni__control {
    opacity: 0.5;
  }

  .cy-ni__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-default);
    flex-shrink: 0;
  }

  .cy-ni--md .cy-ni__btn {
    width: 36px;
    height: 40px;
  }

  .cy-ni--sm .cy-ni__btn {
    width: 28px;
    height: 32px;
  }

  .cy-ni__btn:hover:not(:disabled) {
    background: var(--color-action-secondary-bg);
    color: var(--color-action-secondary-default);
  }

  .cy-ni__btn:active:not(:disabled) {
    background: var(--color-action-secondary-active);
  }

  .cy-ni__btn:disabled {
    cursor: not-allowed;
  }

  .cy-ni__btn--dec {
    border-right: 1px solid var(--input-border);
  }

  .cy-ni__btn--inc {
    border-left: 1px solid var(--input-border);
  }

  .cy-ni__field-wrapper {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .cy-ni__field {
    font-family: var(--font-mono);
    color: var(--input-text);
    background: transparent;
    border: none;
    outline: none;
    text-align: center;
    width: 100%;
    padding: 0 var(--space-2);
  }

  .cy-ni--md .cy-ni__field {
    font-size: 0.9375rem;
    height: 40px;
  }

  .cy-ni--sm .cy-ni__field {
    font-size: 0.8125rem;
    height: 32px;
  }

  .cy-ni__unit {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    padding-right: var(--space-2);
    flex-shrink: 0;
    white-space: nowrap;
  }

  .cy-ni__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
