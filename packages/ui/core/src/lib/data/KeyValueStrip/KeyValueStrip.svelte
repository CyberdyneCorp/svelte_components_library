<svelte:options runes={true} />

<script lang="ts">
  import CopyButton from "../../primitives/CopyButton/CopyButton.svelte";
  import type { KeyValueStripItem } from "./types.js";

  let {
    items = [],
    ariaLabel = undefined,
    copyLabel = "Copy",
  }: {
    /** Facts to show, in order. */
    items: KeyValueStripItem[];
    /** Accessible name of the list, e.g. "SSH access". */
    ariaLabel?: string;
    /** Verb used as "{copyLabel} {label}" on each CopyButton (i18n). */
    copyLabel?: string;
  } = $props();
</script>

<ul class="cy-kv-strip" aria-label={ariaLabel}>
  {#each items as item (item.id)}
    <li class="cy-kv-strip__item">
      <span class="cy-kv-strip__label">{item.label}:</span>
      {#if item.href}
        <a class="cy-kv-strip__link" href={item.href}>{item.linkLabel ?? item.value}</a>
      {:else}
        <span class="cy-kv-strip__value">{item.value}</span>
      {/if}
      {#if item.copy}
        <CopyButton text={item.value} label="{copyLabel} {item.label}" size="sm" />
      {/if}
    </li>
  {/each}
</ul>

<style>
  .cy-kv-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    row-gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }

  .cy-kv-strip__item {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    min-width: 0;
    padding-inline-end: var(--space-3);
  }

  /* One divider between neighbours; wrapped rows simply start without one. */
  .cy-kv-strip__item + .cy-kv-strip__item::before {
    content: "";
    align-self: stretch;
    margin-inline-end: var(--space-2);
    border-inline-start: var(--border-width) var(--border-style) var(--color-border-default);
  }

  .cy-kv-strip__label {
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  .cy-kv-strip__value {
    min-width: 0;
    overflow: hidden;
    font-family: var(--font-mono);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cy-kv-strip__link {
    color: var(--color-text-link);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .cy-kv-strip__link:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
    border-radius: var(--radius-xs);
  }

  /* Icon-only copy affordance: the accessible name comes from CopyButton's aria-label. */
  .cy-kv-strip__item :global(.cy-copy__label) {
    display: none;
  }
</style>
