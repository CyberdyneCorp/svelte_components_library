<svelte:options runes={true} />

<script lang="ts">
  let {
    options = [],
    value = $bindable(""),
    name = `cy-radio-${Math.random().toString(36).slice(2, 9)}`,
    label = "",
    disabled = false,
    error = "",
  }: {
    options?: Array<{ value: string; label: string }>;
    value?: string;
    name?: string;
    label?: string;
    disabled?: boolean;
    error?: string;
  } = $props();
</script>

<fieldset class="cy-radio" class:cy-radio--error={!!error} class:cy-radio--disabled={disabled}>
  {#if label}
    <legend class="cy-radio__legend">{label}</legend>
  {/if}

  <div class="cy-radio__group">
    {#each options as option}
      <label class="cy-radio__item">
        <input
          class="cy-radio__input"
          type="radio"
          {name}
          value={option.value}
          bind:group={value}
          {disabled}
        />
        <span class="cy-radio__circle">
          <span class="cy-radio__dot"></span>
        </span>
        <span class="cy-radio__label">{option.label}</span>
      </label>
    {/each}
  </div>

  {#if error}
    <p class="cy-radio__error" role="alert">{error}</p>
  {/if}
</fieldset>

<style>
  .cy-radio {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    border: none;
    padding: 0;
    margin: 0;
  }

  .cy-radio--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .cy-radio__legend {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary, #fff);
    margin-bottom: var(--space-2);
  }

  .cy-radio__group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .cy-radio__item {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    user-select: none;
  }

  .cy-radio__input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .cy-radio__circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 1px solid var(--input-border, rgba(255, 255, 255, 0.12));
    border-radius: 50%;
    background: var(--input-bg, transparent);
    transition: all var(--transition-default);
    flex-shrink: 0;
  }

  .cy-radio__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-action-brand-default, #00ff41);
    transform: scale(0);
    transition: transform var(--transition-default);
  }

  .cy-radio__input:checked + .cy-radio__circle {
    border-color: var(--color-action-brand-default, #00ff41);
  }

  .cy-radio__input:checked + .cy-radio__circle .cy-radio__dot {
    transform: scale(1);
  }

  .cy-radio__input:focus-visible + .cy-radio__circle {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-radio__item:hover .cy-radio__circle {
    border-color: var(--color-border-strong, rgba(255, 255, 255, 0.2));
  }

  .cy-radio--error .cy-radio__circle {
    border-color: var(--input-border-error, #ef4444);
  }

  .cy-radio__label {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary, #fff);
  }

  .cy-radio__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error, #ef4444);
    margin: 0;
  }
</style>
