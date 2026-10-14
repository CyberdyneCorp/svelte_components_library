<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    title,
    description,
    type = "radio",
    name,
    value,
    group = $bindable(),
    checked = $bindable(false),
    disabled = false,
    onchange,
    icon,
    meta,
    children,
  }: {
    /** Option name; also the input's accessible name. */
    title: string;
    /** One line under the title; also the input's accessible description. */
    description?: string;
    /** Native input type: one choice of many (radio) or an independent toggle (checkbox). */
    type?: "radio" | "checkbox";
    /** Native `name`; radios sharing it form one group (arrow keys move between them). */
    name?: string;
    /** Native `value`; for radios, what `group` is set to when this card is chosen. */
    value?: string;
    /** Selected value of a radio group (`bind:group`). */
    group?: string;
    /** Checked state of a checkbox card (`bind:checked`). */
    checked?: boolean;
    disabled?: boolean;
    /** Called with the input's new checked state. */
    onchange?: (checked: boolean) => void;
    /** Decorative icon at the start of the card. */
    icon?: Snippet;
    /** Trailing detail such as a price or a badge. */
    meta?: Snippet;
    /** Extra content under the description (e.g. a feature list). */
    children?: Snippet;
  } = $props();

  const uid = `cy-option-card-${Math.random().toString(36).slice(2, 9)}`;

  // A native radio is unchecked without its own change event when a sibling is
  // chosen, so radios derive their state from `group` instead of `checked`.
  let isChecked = $derived(type === "radio" ? group !== undefined && group === value : checked);

  function handleChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    if (type === "radio") {
      if (input.checked) group = value;
    } else {
      checked = input.checked;
    }
    onchange?.(input.checked);
  }
</script>

<label class="cy-option-card" class:cy-option-card--disabled={disabled}>
  <input
    class="cy-option-card__input"
    {type}
    {name}
    {value}
    checked={isChecked}
    {disabled}
    aria-labelledby="{uid}-title"
    aria-describedby={description ? `${uid}-description` : undefined}
    onchange={handleChange}
  />
  {#if icon}
    <span class="cy-option-card__icon" aria-hidden="true">{@render icon()}</span>
  {/if}
  <span class="cy-option-card__text">
    <span class="cy-option-card__title" id="{uid}-title">{title}</span>
    {#if description}
      <span class="cy-option-card__description" id="{uid}-description">{description}</span>
    {/if}
    {#if children}
      <span class="cy-option-card__body">{@render children()}</span>
    {/if}
  </span>
  {#if meta}
    <span class="cy-option-card__meta">{@render meta()}</span>
  {/if}
  <span class="cy-option-card__indicator cy-option-card__indicator--{type}" aria-hidden="true"></span>
</label>

<style>
  .cy-option-card {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-surface-default);
    border: var(--border-width) var(--border-style) var(--color-border-default);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
    font-family: var(--font-body);
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast);
  }

  .cy-option-card:hover:not(.cy-option-card--disabled) {
    background: var(--color-surface-hover);
    border-color: var(--color-border-strong);
  }

  .cy-option-card:has(.cy-option-card__input:checked) {
    border-color: var(--color-border-brand);
    background: var(--color-surface-active);
  }

  .cy-option-card:has(.cy-option-card__input:focus-visible) {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-option-card--disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  /* Visually hidden but focusable and form-participating. */
  .cy-option-card__input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  .cy-option-card__icon {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--color-text-secondary);
  }

  .cy-option-card__text {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    gap: var(--space-1);
  }

  .cy-option-card__title {
    font-weight: var(--font-weight-semibold);
    font-size: 0.9375rem;
  }

  .cy-option-card__description {
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.45;
  }

  .cy-option-card__body {
    margin-top: var(--space-2);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .cy-option-card__meta {
    flex-shrink: 0;
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
  }

  .cy-option-card__indicator {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border: 2px solid var(--color-border-strong);
    background: var(--color-surface-default);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .cy-option-card__indicator--radio {
    border-radius: 50%;
  }

  .cy-option-card__indicator--checkbox {
    position: relative;
    border-radius: var(--radius-sm);
  }

  .cy-option-card:has(.cy-option-card__input:checked) .cy-option-card__indicator--checkbox::after {
    content: "";
    position: absolute;
    left: 4px;
    top: 0;
    width: 5px;
    height: 10px;
    border: solid var(--color-text-inverse);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .cy-option-card:has(.cy-option-card__input:checked) .cy-option-card__indicator {
    border-color: var(--color-action-brand-default);
  }

  .cy-option-card:has(.cy-option-card__input:checked) .cy-option-card__indicator--radio {
    box-shadow: inset 0 0 0 3px var(--color-surface-default);
    background: var(--color-action-brand-default);
  }

  .cy-option-card:has(.cy-option-card__input:checked) .cy-option-card__indicator--checkbox {
    background: var(--color-action-brand-default);
  }

  @media (prefers-reduced-motion: reduce) {
    .cy-option-card,
    .cy-option-card__indicator {
      transition: none;
    }
  }
</style>
