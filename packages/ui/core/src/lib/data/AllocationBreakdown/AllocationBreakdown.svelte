<svelte:options runes={true} />

<script lang="ts">
  import { allocationWidth, type AllocationItem } from "./types.js";

  let {
    items = [],
    ariaLabel,
    description = "",
    locale = "en",
    emptyLabel = "No allocation data",
    unavailableLabel = "Unavailable",
  }: {
    items?: AllocationItem[];
    ariaLabel: string;
    /** Explain the denominator and that bars show relative magnitudes. */
    description?: string;
    locale?: string;
    emptyLabel?: string;
    unavailableLabel?: string;
  } = $props();

  const descriptionId = $props.id();
  let maximum = $derived(
    items.reduce(
      (max, item) =>
        Number.isFinite(item.percentage) ? Math.max(max, Math.abs(item.percentage)) : max,
      0,
    ),
  );
  let formatter = $derived(new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }));
</script>

<section
  class="cy-allocation"
  aria-label={ariaLabel}
  aria-describedby={description ? descriptionId : undefined}
>
  {#if description}<p class="cy-allocation__description" id={descriptionId}>{description}</p>{/if}
  {#if items.length === 0}
    <p class="cy-allocation__empty">{emptyLabel}</p>
  {:else}
    <ul class="cy-allocation__list">
      {#each items as item (item.id)}
        {@const valid = Number.isFinite(item.percentage)}
        {@const width = allocationWidth(item.percentage, maximum)}
        <li class="cy-allocation__row" data-tone={item.tone ?? "brand"}>
          <span class="cy-allocation__label"
            ><span class="cy-allocation__marker" aria-hidden="true"></span>{item.label}</span
          >
          <div class="cy-allocation__track" aria-hidden="true">
            <span
              class="cy-allocation__bar"
              class:cy-allocation__bar--negative={valid && item.percentage < 0}
              style:width={`${width}%`}
              style:left={`${valid && item.percentage < 0 ? 50 - width : 50}%`}
            ></span>
          </div>
          <span class="cy-allocation__numbers"
            ><span>{item.value}</span><span class="cy-allocation__percentage"
              >{valid ? `${formatter.format(item.percentage)}%` : unavailableLabel}</span
            ></span
          >
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .cy-allocation {
    min-width: 0;
    color: var(--color-text-primary);
    font-family: var(--font-body);
  }
  .cy-allocation__description,
  .cy-allocation__empty {
    margin: 0 0 var(--space-4);
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.5;
  }
  .cy-allocation__list {
    padding: 0;
    margin: 0;
    list-style: none;
    display: grid;
    gap: var(--space-4);
  }
  .cy-allocation__row {
    --allocation-tone: var(--color-action-brand-default);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(4rem, 2fr) minmax(0, 1.25fr);
    gap: var(--space-3);
    align-items: center;
    font-size: 0.875rem;
  }
  .cy-allocation__row[data-tone="info"] {
    --allocation-tone: var(--color-state-info);
  }
  .cy-allocation__row[data-tone="violet"] {
    --allocation-tone: var(--color-accent-violet);
  }
  .cy-allocation__row[data-tone="warning"] {
    --allocation-tone: var(--color-state-warning);
  }
  .cy-allocation__row[data-tone="negative"] {
    --allocation-tone: var(--color-state-error);
  }
  .cy-allocation__label {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    overflow-wrap: anywhere;
  }
  .cy-allocation__marker {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--allocation-tone);
  }
  .cy-allocation__track {
    position: relative;
    height: 0.5rem;
    border-radius: var(--radius-pill);
    background: var(--color-surface-active);
  }
  .cy-allocation__track::after {
    content: "";
    position: absolute;
    left: 50%;
    top: -0.25rem;
    height: 1rem;
    width: 1px;
    background: var(--color-text-tertiary);
  }
  .cy-allocation__bar {
    position: absolute;
    height: 100%;
    background: var(--allocation-tone);
    border-radius: 0 var(--radius-pill) var(--radius-pill) 0;
  }
  .cy-allocation__bar--negative {
    border-radius: var(--radius-pill) 0 0 var(--radius-pill);
  }
  .cy-allocation__numbers {
    display: grid;
    gap: var(--space-1);
    text-align: right;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
  .cy-allocation__percentage {
    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }
  @media (max-width: 600px) {
    .cy-allocation__row {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
    .cy-allocation__track {
      grid-column: 1 / -1;
      grid-row: 2;
    }
    .cy-allocation__numbers {
      grid-column: 2;
      grid-row: 1;
    }
  }
</style>
