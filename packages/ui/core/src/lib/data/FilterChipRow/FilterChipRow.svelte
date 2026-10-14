<svelte:options runes={true} />

<script lang="ts">
  import { tick } from "svelte";
  import Icon from "../../primitives/Icon/Icon.svelte";
  import {
    describeCondition,
    isConditionComplete,
    mergeQueryLabels,
    type Query,
    type QueryField,
    type QueryLabelsInput,
  } from "../../forms/QueryBuilder/query.js";

  let {
    fields,
    query,
    onremove,
    onclear,
    labels = {},
    ariaLabel = "Active filters",
  }: {
    /** Fields the query's conditions refer to. */
    fields: QueryField[];
    /** Query whose complete conditions are shown. */
    query: Query;
    /** Called with the id of the condition whose chip was dismissed. */
    onremove: (conditionId: string) => void;
    /** When given, a "Clear all" button calls it. */
    onclear?: () => void;
    /** Localized strings; each key falls back to English. */
    labels?: QueryLabelsInput;
    /** Accessible name of the chip list. */
    ariaLabel?: string;
  } = $props();

  let l = $derived(mergeQueryLabels(labels));
  let rootEl: HTMLDivElement | undefined = $state();

  let chips = $derived(
    query.conditions
      .filter((c) => isConditionComplete(c, fields))
      .map((c) => ({
        id: c.id,
        description: describeCondition(c, fields.find((f) => f.key === c.field), l),
      })),
  );

  /**
   * Next chip's button, else the previous one, else the root. "Clear all"
   * only renders beside chips, so it is never left alone to take focus.
   */
  async function restoreFocus(index: number) {
    await tick();
    const buttons = rootEl?.querySelectorAll<HTMLButtonElement>(".cy-filter-chips__remove") ?? [];
    const target = buttons[index] ?? buttons[index - 1] ?? rootEl;
    target?.focus();
  }

  function remove(id: string, index: number) {
    onremove(id);
    restoreFocus(index);
  }
</script>

<div class="cy-filter-chips" bind:this={rootEl} tabindex="-1">
  {#if chips.length > 0}
    {#if query.combinator === "or" && chips.length >= 2}
      <span class="cy-filter-chips__match">{l.matchAny}:</span>
    {/if}
    <ul class="cy-filter-chips__list" aria-label={ariaLabel}>
      {#each chips as chip, i (chip.id)}
        <li class="cy-filter-chips__chip">
          <span class="cy-filter-chips__text">{chip.description}</span>
          <button
            type="button"
            class="cy-filter-chips__remove"
            aria-label={l.removeFilter(chip.description)}
            title={l.removeFilter(chip.description)}
            onclick={() => remove(chip.id, i)}
          >
            <Icon name="x" size={12} />
          </button>
        </li>
      {/each}
    </ul>
    {#if onclear}
      <button type="button" class="cy-filter-chips__clear" onclick={() => onclear()}>
        {l.clearAll}
      </button>
    {/if}
  {/if}
</div>

<style>
  .cy-filter-chips {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-body);
    font-size: 0.8125rem;
  }

  .cy-filter-chips:focus {
    outline: none;
  }

  .cy-filter-chips__match {
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  .cy-filter-chips__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .cy-filter-chips__chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    max-width: 100%;
    padding: var(--space-1) var(--space-1) var(--space-1) var(--space-3);
    border: var(--border-width) var(--border-style) var(--color-border-default);
    border-radius: var(--radius-pill);
    background: var(--color-surface-raised);
    color: var(--color-text-primary);
  }

  .cy-filter-chips__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cy-filter-chips__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--color-text-tertiary);
    cursor: pointer;
  }

  .cy-filter-chips__remove:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-filter-chips__remove:focus-visible,
  .cy-filter-chips__clear:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-filter-chips__clear {
    padding: var(--space-1) var(--space-2);
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-link);
    font: inherit;
    cursor: pointer;
  }

  .cy-filter-chips__clear:hover {
    text-decoration: underline;
  }
</style>
