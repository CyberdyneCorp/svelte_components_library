<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";
  import type { DescriptionListItem } from "./types.js";

  let {
    items,
    columns = 1,
    dividers = true,
    value,
    action,
  }: {
    /** Rows to render, in order. */
    items: DescriptionListItem[];
    /** Number of label/value columns at desktop widths; collapses to one on narrow screens. */
    columns?: 1 | 2;
    /** Draw a divider between rows. */
    dividers?: boolean;
    /** Rich value for a row (e.g. a StatusBadge); replaces `item.value`. */
    value?: Snippet<[DescriptionListItem]>;
    /** Control rendered after the value (e.g. an edit IconButton or a link). */
    action?: Snippet<[DescriptionListItem]>;
  } = $props();
</script>

<dl
  class="cy-description-list"
  class:cy-description-list--two-columns={columns === 2}
  class:cy-description-list--dividers={dividers}
>
  {#each items as item (item.id)}
    <div class="cy-description-list__row">
      <dt class="cy-description-list__label">{item.label}</dt>
      <dd class="cy-description-list__details">
        <span class="cy-description-list__content">
          {#if value}
            <span class="cy-description-list__value">{@render value(item)}</span>
          {:else if item.value}
            <span class="cy-description-list__value">{item.value}</span>
          {/if}
          {#if item.hint}
            <span class="cy-description-list__hint">{item.hint}</span>
          {/if}
        </span>
        {#if action}
          <span class="cy-description-list__action">
            {@render action(item)}
          </span>
        {/if}
      </dd>
    </div>
  {/each}
</dl>

<style>
  .cy-description-list {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    margin: 0;
    font-family: var(--font-body);
    color: var(--color-text-primary);
  }

  .cy-description-list--two-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--space-6);
  }

  .cy-description-list__row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-2) var(--space-4);
    min-width: 0;
    padding: var(--space-3) 0;
  }

  .cy-description-list--dividers .cy-description-list__row {
    border-bottom: var(--border-width) var(--border-style) var(--color-border-subtle);
  }

  .cy-description-list__label {
    flex: 0 0 11rem;
    margin: 0;
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    overflow-wrap: anywhere;
  }

  .cy-description-list__details {
    display: flex;
    flex: 1 1 12rem;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    min-width: 0;
    margin: 0;
  }

  .cy-description-list__content {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .cy-description-list__value {
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    overflow-wrap: anywhere;
  }

  .cy-description-list__hint {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    overflow-wrap: anywhere;
  }

  .cy-description-list__action {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
  }

  /* Narrow widths: one column; value and action drop below the label. */
  @media (max-width: 640px) {
    .cy-description-list--two-columns {
      grid-template-columns: minmax(0, 1fr);
    }

    .cy-description-list__label {
      flex-basis: 100%;
    }
  }
</style>
