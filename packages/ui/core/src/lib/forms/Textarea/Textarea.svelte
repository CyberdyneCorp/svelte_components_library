<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable(""),
    label = "",
    placeholder = "",
    hint = "",
    error = "",
    disabled = false,
    rows = 4,
    maxlength = undefined,
    oninput,
  }: {
    value?: string;
    label?: string;
    placeholder?: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
    rows?: number;
    maxlength?: number | undefined;
    oninput?: (e: Event) => void;
  } = $props();

  let inputId = `cy-textarea-${Math.random().toString(36).slice(2, 9)}`;
  let charCount = $derived(value.length);
</script>

<div class="cy-textarea" class:cy-textarea--error={!!error} class:cy-textarea--disabled={disabled}>
  {#if label}
    <label class="cy-textarea__label" for={inputId}>{label}</label>
  {/if}

  <textarea
    class="cy-textarea__field"
    id={inputId}
    bind:value
    {placeholder}
    {disabled}
    {rows}
    {maxlength}
    {oninput}
    aria-invalid={!!error}
    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
  ></textarea>

  <div class="cy-textarea__footer">
    {#if error}
      <p class="cy-textarea__error" id="{inputId}-error" role="alert">{error}</p>
    {:else if hint}
      <p class="cy-textarea__hint" id="{inputId}-hint">{hint}</p>
    {:else}
      <span></span>
    {/if}

    {#if maxlength !== undefined}
      <span class="cy-textarea__count" class:cy-textarea__count--limit={charCount >= maxlength}>
        {charCount}/{maxlength}
      </span>
    {/if}
  </div>
</div>

<style>
  .cy-textarea {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
  }

  .cy-textarea__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-textarea__field {
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--input-text);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    width: 100%;
    outline: none;
    resize: vertical;
    transition: all var(--transition-default);
  }

  .cy-textarea__field::placeholder {
    color: var(--input-placeholder);
  }

  .cy-textarea__field:hover:not(:disabled) {
    background: var(--input-bg-hover);
  }

  .cy-textarea__field:focus {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-textarea--error .cy-textarea__field {
    border-color: var(--input-border-error);
  }

  .cy-textarea--error .cy-textarea__field:focus {
    border-color: var(--input-border-error);
    box-shadow: var(--shadow-glow-red);
  }

  .cy-textarea__field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-textarea__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cy-textarea__hint {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    margin: 0;
  }

  .cy-textarea__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }

  .cy-textarea__count {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    margin-left: auto;
  }

  .cy-textarea__count--limit {
    color: var(--color-state-error);
  }
</style>
