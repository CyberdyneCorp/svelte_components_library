<svelte:options runes={true} />

<script lang="ts">
  import {
    clampMoney,
    currencyMinorUnits,
    formatMoney,
    parseMoneyInput,
    sanitizeMoneyTyping,
    toEditableMoney,
  } from "./money.js";

  let {
    // Canonical decimal string ("1234.56"), never a number; null when empty.
    value = $bindable(null),
    currency,
    locale = undefined,
    min = undefined,
    max = undefined,
    label = "",
    error = "",
    hint = "",
    name = undefined,
    disabled = false,
    required = false,
    id = "",
    allowNegative = false,
    onchange,
  }: {
    value?: string | null;
    /** ISO 4217 code, e.g. "USD". Sets symbol and fraction digits. */
    currency: string;
    locale?: string;
    /** Decimal-string bounds, applied when the field loses focus. */
    min?: string;
    max?: string;
    label?: string;
    error?: string;
    hint?: string;
    /** Renders a hidden input carrying the canonical value for form posts. */
    name?: string;
    disabled?: boolean;
    required?: boolean;
    id?: string;
    allowNegative?: boolean;
    onchange?: (value: string | null) => void;
  } = $props();

  let inputId = $derived(id || `cy-mi-${Math.random().toString(36).slice(2, 9)}`);
  let minorUnits = $derived(currencyMinorUnits(currency, locale));
  let focused = $state(false);
  let draft = $state("");

  let display = $derived.by(() => {
    if (focused) return draft;
    return value == null ? "" : formatMoney(value, { currency, locale });
  });

  let describedBy = $derived(
    [hint && `${inputId}-hint`, error && `${inputId}-error`].filter(Boolean).join(" ") || undefined,
  );

  function commit(next: string | null) {
    if (next === value) return;
    value = next;
    onchange?.(next);
  }

  function handleFocus() {
    draft = value == null ? "" : toEditableMoney(value, locale);
    focused = true;
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    draft = sanitizeMoneyTyping(target.value, allowNegative);
    // Keep rejected characters out of the field itself.
    if (target.value !== draft) target.value = draft;
    commit(parseMoneyInput(draft, minorUnits, allowNegative));
  }

  function handleBlur() {
    focused = false;
    if (value != null) commit(clampMoney(value, minorUnits, min, max));
  }
</script>

<div class="cy-mi" class:cy-mi--error={!!error} class:cy-mi--disabled={disabled}>
  {#if label}
    <label class="cy-mi__label" for={inputId}>
      {label}
      {#if required}<span class="cy-mi__required" aria-hidden="true">*</span>{/if}
    </label>
  {/if}

  <div class="cy-mi__control">
    <input
      class="cy-mi__field"
      id={inputId}
      type="text"
      inputmode="decimal"
      autocomplete="off"
      value={display}
      {disabled}
      {required}
      onfocus={handleFocus}
      oninput={handleInput}
      onblur={handleBlur}
      aria-invalid={!!error}
      aria-describedby={describedBy}
    />
    {#if focused}
      <span class="cy-mi__currency" aria-hidden="true">{currency}</span>
    {/if}
  </div>

  {#if name}
    <input type="hidden" {name} value={value ?? ""} />
  {/if}

  {#if hint}
    <p class="cy-mi__hint" id="{inputId}-hint">{hint}</p>
  {/if}
  {#if error}
    <p class="cy-mi__error" id="{inputId}-error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-mi {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
  }

  .cy-mi__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-mi__required {
    color: var(--color-state-error);
    margin-left: 2px;
  }

  .cy-mi__control {
    display: flex;
    align-items: center;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    transition: all var(--transition-default);
  }

  .cy-mi__control:hover {
    background: var(--input-bg-hover);
  }

  .cy-mi__control:focus-within {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-mi--error .cy-mi__control {
    border-color: var(--input-border-error);
  }

  .cy-mi--disabled .cy-mi__control {
    opacity: 0.5;
  }

  .cy-mi__field {
    font-family: var(--font-mono);
    font-size: 0.9375rem;
    font-variant-numeric: tabular-nums;
    color: var(--input-text);
    background: transparent;
    border: none;
    outline: none;
    text-align: right;
    width: 100%;
    height: 40px;
    padding: 0 var(--space-3);
  }

  .cy-mi__field:disabled {
    cursor: not-allowed;
  }

  .cy-mi__currency {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    padding-right: var(--space-3);
    flex-shrink: 0;
  }

  .cy-mi__hint {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    margin: 0;
  }

  .cy-mi__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
