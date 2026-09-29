<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";
  import { DEFAULT_TREND_LABELS, type KpiSentiment, type KpiTrend, type KpiTrendLabels } from "./types.js";

  let {
    label,
    value,
    delta = "",
    deltaLabel = "",
    trend,
    sentiment = "neutral",
    href = "",
    sparkline,
    trendLabels = {},
    ariaLabel = "",
  }: {
    /** Metric name, e.g. "Monthly spend". */
    label: string;
    /**
     * Preformatted value, e.g. "€1,240.00", or a snippet for rich markup
     * (e.g. a masked `CurrencyDisplay`). Snippet content renders in the same
     * value element, so it stays part of the link's accessible name.
     */
    value: string | Snippet;
    /** Preformatted change, e.g. "+4.2%". */
    delta?: string;
    /** Context for the change, e.g. "vs last month". */
    deltaLabel?: string;
    /** Direction of change; renders an arrow icon plus hidden text. */
    trend?: KpiTrend;
    /** Colour of the change, independent of direction (rising expenses are negative). */
    sentiment?: KpiSentiment;
    /** When set, the whole card is a link. */
    href?: string;
    /** Optional sparkline (or any small chart) rendered under the value. */
    sparkline?: Snippet;
    /** Hidden words announced for each trend (i18n). */
    trendLabels?: Partial<KpiTrendLabels>;
    /** Overrides the accessible name of the card or link. */
    ariaLabel?: string;
  } = $props();

  const labelId = `cy-kpi-${Math.random().toString(36).slice(2, 9)}`;

  let labels = $derived({ ...DEFAULT_TREND_LABELS, ...trendLabels });
  let hasDelta = $derived(Boolean(trend || delta || deltaLabel));
</script>

{#snippet trendIcon(direction: KpiTrend)}
  <svg class="cy-kpi__icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
    {#if direction === "up"}
      <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
    {:else if direction === "down"}
      <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
    {:else}
      <path d="M3 8h10M9.5 4.5 13 8l-3.5 3.5" />
    {/if}
  </svg>
{/snippet}

{#snippet body()}
  <div class="cy-kpi__label" id={labelId}>{label}</div>
  <div class="cy-kpi__value">
    {#if typeof value === "function"}{@render value()}{:else}{value}{/if}
  </div>
  {#if hasDelta}
    <div class="cy-kpi__delta cy-kpi__delta--{sentiment}">
      {#if trend}
        {@render trendIcon(trend)}
        <span class="cy-kpi__sr">{labels[trend]} </span>
      {/if}
      {#if delta}<span class="cy-kpi__delta-value">{delta}</span>{/if}
      {#if deltaLabel}<span class="cy-kpi__delta-label"> {deltaLabel}</span>{/if}
    </div>
  {/if}
  {#if sparkline}
    <div class="cy-kpi__sparkline">{@render sparkline()}</div>
  {/if}
{/snippet}

{#if href}
  <a class="cy-kpi cy-kpi--link" {href} aria-label={ariaLabel || undefined}>
    {@render body()}
  </a>
{:else}
  <article
    class="cy-kpi"
    aria-label={ariaLabel || undefined}
    aria-labelledby={ariaLabel ? undefined : labelId}
  >
    {@render body()}
  </article>
{/if}

<style>
  .cy-kpi {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-4) var(--space-5);
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    color: var(--color-text-primary);
    font-family: var(--font-body);
    text-decoration: none;
    transition: border-color var(--transition-default);
  }

  .cy-kpi--link:hover {
    border-color: var(--card-hover-border);
  }

  .cy-kpi--link:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-kpi__label {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .cy-kpi__value {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: var(--font-weight-semibold);
    line-height: 1.2;
  }

  .cy-kpi__delta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1);
    font-size: 0.8125rem;
  }

  .cy-kpi__delta--positive {
    color: var(--color-state-success);
  }

  .cy-kpi__delta--negative {
    color: var(--color-state-error);
  }

  .cy-kpi__delta--neutral {
    color: var(--color-text-secondary);
  }

  .cy-kpi__icon {
    flex-shrink: 0;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .cy-kpi__delta-value {
    font-weight: var(--font-weight-medium);
  }

  .cy-kpi__delta-label {
    color: var(--color-text-secondary);
  }

  .cy-kpi__sparkline {
    margin-top: var(--space-2);
  }

  .cy-kpi__sr {
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
</style>
