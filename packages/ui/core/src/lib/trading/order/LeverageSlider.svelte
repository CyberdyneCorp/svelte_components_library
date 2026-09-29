<svelte:options runes={true} />

<script lang="ts">
  import { DEFAULT_LEVERAGE_LABELS, type LeverageSliderLabels } from "./labels.js";
  import { clampLeverage, defaultMarks, leverageAfterKey } from "./leverage.js";

  let {
    value = $bindable(1),
    max,
    marks = undefined,
    labels = {},
    error = "",
    disabled = false,
    id = "",
    onchange,
  }: {
    /** Whole leverage, 1 to `max`. */
    value?: number;
    /** Highest leverage (the market's `maxLeverage`). */
    max: number;
    /** Quick-set marks; defaults to 1×, a few round values and `max`. */
    marks?: number[];
    labels?: Partial<LeverageSliderLabels>;
    /** Message shown under the slider (e.g. from the ticket's validation). */
    error?: string;
    disabled?: boolean;
    id?: string;
    onchange?: (value: number) => void;
  } = $props();

  let text = $derived({ ...DEFAULT_LEVERAGE_LABELS, ...labels });
  let baseId = $derived(id || `cy-lev-${Math.random().toString(36).slice(2, 9)}`);
  let top = $derived(clampLeverage(max, max));
  let markList = $derived((marks ?? defaultMarks(top)).filter((mark) => mark >= 1 && mark <= top));
  let fill = $derived(top > 1 ? ((value - 1) / (top - 1)) * 100 : 100);

  function set(next: number) {
    const clamped = clampLeverage(next, top);
    if (clamped === value) return;
    value = clamped;
    onchange?.(clamped);
  }

  function handleKeydown(event: KeyboardEvent) {
    const next = leverageAfterKey(event.key, value, top);
    if (next === null) return;
    event.preventDefault();
    set(next);
  }

  function handleRange(event: Event) {
    set(Number((event.currentTarget as HTMLInputElement).value));
  }

  function handleNumber(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    set(input.value === "" ? value : Number(input.value));
    input.value = String(value);
  }
</script>

<div class="cy-lev" class:cy-lev--disabled={disabled}>
  <div class="cy-lev__header">
    <label class="cy-lev__label" for="{baseId}-range">{text.label}</label>
    <div class="cy-lev__number">
      <input
        class="cy-lev__input"
        type="number"
        min="1"
        max={top}
        step="1"
        inputmode="numeric"
        value={value}
        {disabled}
        aria-label={text.input}
        aria-invalid={!!error}
        onchange={handleNumber}
      />
      <span class="cy-lev__suffix" aria-hidden="true">×</span>
    </div>
  </div>

  <input
    class="cy-lev__range"
    id="{baseId}-range"
    type="range"
    min="1"
    max={top}
    step="1"
    {value}
    {disabled}
    style="--cy-lev-fill: {fill}%"
    aria-valuetext={text.value(value)}
    aria-invalid={!!error}
    aria-describedby={error ? `${baseId}-error` : undefined}
    onkeydown={handleKeydown}
    oninput={handleRange}
  />

  <div class="cy-lev__marks">
    {#each markList as mark (mark)}
      <button
        type="button"
        class="cy-lev__mark"
        class:cy-lev__mark--active={mark === value}
        tabindex="-1"
        {disabled}
        aria-label={text.mark(mark)}
        onclick={() => set(mark)}
      >
        {text.value(mark)}
      </button>
    {/each}
  </div>

  {#if error}
    <p class="cy-lev__error" id="{baseId}-error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-lev {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
  }

  .cy-lev__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .cy-lev__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-lev__number {
    display: flex;
    align-items: center;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding-right: var(--space-2);
  }

  .cy-lev__number:focus-within {
    border-color: var(--input-border-focus);
  }

  .cy-lev__input {
    width: 4.5rem;
    height: 32px;
    padding: 0 var(--space-2);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    text-align: right;
    color: var(--input-text);
    background: transparent;
    border: none;
    outline: none;
  }

  .cy-lev__suffix {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .cy-lev__range {
    width: 100%;
    margin: 0;
    height: 6px;
    appearance: none;
    border-radius: var(--radius-pill);
    background: linear-gradient(
      to right,
      var(--color-border-focus) 0 var(--cy-lev-fill),
      var(--color-border-default) var(--cy-lev-fill) 100%
    );
    cursor: pointer;
  }

  .cy-lev__range:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 4px;
  }

  .cy-lev__range::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-text-primary);
    border: 2px solid var(--color-border-focus);
  }

  .cy-lev__range::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-text-primary);
    border: 2px solid var(--color-border-focus);
  }

  .cy-lev__marks {
    display: flex;
    justify-content: space-between;
    gap: var(--space-1);
  }

  .cy-lev__mark {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    padding: var(--space-1);
    cursor: pointer;
  }

  .cy-lev__mark:hover {
    color: var(--color-text-primary);
    border-color: var(--color-border-default);
  }

  .cy-lev__mark--active {
    color: var(--color-text-primary);
    border-color: var(--color-border-focus);
  }

  .cy-lev--disabled {
    opacity: 0.5;
  }

  .cy-lev--disabled .cy-lev__range,
  .cy-lev--disabled .cy-lev__mark {
    cursor: not-allowed;
  }

  .cy-lev__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
