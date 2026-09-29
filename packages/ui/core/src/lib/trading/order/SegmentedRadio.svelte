<svelte:options runes={true} />

<script lang="ts" generics="T extends string">
  /**
   * Native radio group drawn as a segmented control (internal to the order
   * ticket). Arrow keys move between options as in any radio group.
   */
  let {
    legend,
    options,
    value = $bindable(),
    name,
    size = "md",
    hideLegend = false,
    disabled = false,
    onchange,
  }: {
    legend: string;
    options: { value: T; label: string; tone?: "long" | "short" }[];
    value: T;
    name: string;
    /** `lg` renders the tall Long / Short buttons. */
    size?: "md" | "lg";
    hideLegend?: boolean;
    disabled?: boolean;
    onchange?: (value: T) => void;
  } = $props();

  function select(next: T) {
    if (next === value) return;
    value = next;
    onchange?.(next);
  }
</script>

<fieldset class="cy-seg cy-seg--{size}" {disabled}>
  <legend class="cy-seg__legend" class:cy-seg__legend--hidden={hideLegend}>{legend}</legend>
  <div class="cy-seg__options">
    {#each options as option (option.value)}
      <label
        class="cy-seg__option"
        class:cy-seg__option--checked={option.value === value}
        class:cy-seg__option--long={option.tone === "long"}
        class:cy-seg__option--short={option.tone === "short"}
      >
        <input
          class="cy-seg__input"
          type="radio"
          {name}
          value={option.value}
          checked={option.value === value}
          onchange={() => select(option.value)}
        />
        <span>{option.label}</span>
      </label>
    {/each}
  </div>
</fieldset>

<style>
  .cy-seg {
    border: none;
    margin: 0;
    padding: 0;
    min-width: 0;
  }

  .cy-seg__legend {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0;
    margin-bottom: var(--space-1);
  }

  .cy-seg__legend--hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .cy-seg__options {
    display: flex;
    gap: var(--space-1);
    padding: var(--space-1);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
  }

  .cy-seg__option {
    position: relative;
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    padding: 0 var(--space-2);
    font-family: var(--font-body);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    text-align: center;
  }

  .cy-seg--lg .cy-seg__option {
    min-height: 44px;
    font-size: 1rem;
    font-weight: var(--font-weight-semibold);
  }

  .cy-seg__option:hover {
    color: var(--color-text-primary);
  }

  .cy-seg__option--checked {
    color: var(--color-text-primary);
    background: var(--color-surface-active);
    border-color: var(--color-border-default);
  }

  .cy-seg__option--long.cy-seg__option--checked {
    color: var(--color-trade-long-text);
    background: var(--color-trade-long-bg);
    border-color: var(--color-trade-long);
  }

  .cy-seg__option--short.cy-seg__option--checked {
    color: var(--color-trade-short-text);
    background: var(--color-trade-short-bg);
    border-color: var(--color-trade-short);
  }

  .cy-seg__option:has(.cy-seg__input:focus-visible) {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 1px;
  }

  .cy-seg__input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
  }

  fieldset:disabled .cy-seg__option {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
