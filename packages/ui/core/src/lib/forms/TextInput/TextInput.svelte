<svelte:options runes={true} />

<script lang="ts">
  import type { AriaAttributes, HTMLInputAttributes } from "svelte/elements";

  /** `data-*` attributes forwarded to the native `<input>`. */
  type DataAttributes = { [key: `data-${string}`]: string | number | boolean | null | undefined };

  let {
    value = $bindable(""),
    label = "",
    placeholder = "",
    hint = "",
    error = "",
    disabled = false,
    required = false,
    type = "text",
    id = "",
    /** Bindable reference to the inner `<input>` for imperative focus / select(). */
    inputRef = $bindable(null),
    oninput,
    onchange,
    onfocus,
    onblur,
    onkeydown,
    /** Native `autocomplete` token (e.g. `"off"`, `"email"`, `"one-time-code"`). */
    autocomplete,
    /** Native `spellcheck`; set `false` for addresses, codes and secrets. */
    spellcheck,
    /** Native `maxlength`. */
    maxlength,
    /** Native `name`, for form submission. */
    name,
    /** Native `inputmode` virtual-keyboard hint. */
    inputmode,
    /**
     * Extra ids appended to the input's `aria-describedby`, after the
     * component's own hint / error id.
     */
    "aria-describedby": ariaDescribedby,
    /** Other `aria-*` and `data-*` attributes, forwarded to the native `<input>`. */
    ...rest
  }: {
    value?: string;
    label?: string;
    placeholder?: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    type?:
      | "text"
      | "email"
      | "url"
      | "number"
      | "search"
      | "tel"
      | "date"
      | "datetime-local"
      | "time"
      | "month"
      | "week";
    id?: string;
    inputRef?: HTMLInputElement | null;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
    onfocus?: (e: FocusEvent) => void;
    onblur?: (e: FocusEvent) => void;
    onkeydown?: (e: KeyboardEvent) => void;
    autocomplete?: HTMLInputAttributes["autocomplete"];
    spellcheck?: boolean;
    maxlength?: number;
    name?: string;
    inputmode?: HTMLInputAttributes["inputmode"];
    "aria-describedby"?: string;
  } & Omit<AriaAttributes, "aria-describedby" | "aria-invalid"> &
    DataAttributes = $props();

  let inputId = $derived(id || `cy-input-${Math.random().toString(36).slice(2, 9)}`);

  let describedBy = $derived(
    [error ? `${inputId}-error` : hint ? `${inputId}-hint` : "", ariaDescribedby ?? ""]
      .filter(Boolean)
      .join(" ") || undefined,
  );
</script>

<div class="cy-text-input" class:cy-text-input--error={!!error} class:cy-text-input--disabled={disabled}>
  {#if label}
    <label class="cy-text-input__label" for={inputId}>
      {label}
      {#if required}<span class="cy-text-input__required" aria-hidden="true">*</span>{/if}
    </label>
  {/if}

  <input
    {...rest}
    class="cy-text-input__field"
    {type}
    id={inputId}
    bind:this={inputRef}
    bind:value
    {placeholder}
    {disabled}
    {required}
    {oninput}
    {onchange}
    {onfocus}
    {onblur}
    {onkeydown}
    {autocomplete}
    {spellcheck}
    {maxlength}
    {name}
    {inputmode}
    aria-invalid={!!error}
    aria-describedby={describedBy}
  />

  {#if error}
    <p class="cy-text-input__error" id="{inputId}-error" role="alert">{error}</p>
  {:else if hint}
    <p class="cy-text-input__hint" id="{inputId}-hint">{hint}</p>
  {/if}
</div>

<style>
  .cy-text-input {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
  }

  .cy-text-input__label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    font-weight: var(--input-label-weight);
    color: var(--input-label);
    letter-spacing: var(--input-label-letter-spacing);
    text-transform: var(--input-label-transform);
  }

  .cy-text-input__required {
    color: var(--color-state-error);
    margin-left: 2px;
  }

  .cy-text-input__field {
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--input-text);
    background: var(--input-bg);
    border: var(--border-width) var(--border-style) var(--input-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-inset);
    padding: var(--space-2) var(--space-3);
    height: 40px;
    width: 100%;
    outline: none;
    transition: all var(--transition-default);
  }

  .cy-text-input__field::placeholder {
    color: var(--input-placeholder);
  }

  .cy-text-input__field:hover:not(:disabled) {
    background: var(--input-bg-hover);
  }

  .cy-text-input__field:focus {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-inset), var(--shadow-glow-cyan);
  }

  .cy-text-input--error .cy-text-input__field {
    border-color: var(--input-border-error);
  }

  .cy-text-input--error .cy-text-input__field:focus {
    border-color: var(--input-border-error);
    box-shadow: var(--shadow-inset), var(--shadow-glow-red);
  }

  .cy-text-input__field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-text-input__hint {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    margin: 0;
  }

  .cy-text-input__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
