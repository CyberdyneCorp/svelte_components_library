<svelte:options runes={true} />

<script lang="ts">
  import { currencyMinorUnits, formatMoney } from "../../forms/MoneyInput/money.js";
  import {
    DEFAULT_BUDGET_MESSAGES,
    DEFAULT_STATE_LABELS,
    computeBudget,
    type BudgetMessages,
    type BudgetState,
    type BudgetStateLabels,
  } from "./budget.js";

  let {
    spent,
    limit,
    committed,
    currency,
    locale,
    thresholds = [0.8, 1],
    label,
    stateLabels = {},
    messages = {},
    ariaLabel = "",
  }: {
    /** Amount spent so far, as a decimal string ("820.00"). */
    spent: string;
    /** Budget limit, as a decimal string ("1000"). "0" or invalid never divides. */
    limit: string;
    /** Amount committed but not yet spent, drawn stacked after `spent`. */
    committed?: string;
    /** ISO 4217 currency code. */
    currency: string;
    locale?: string;
    /** [approaching, exceeded] as spent/limit ratios. */
    thresholds?: readonly [number, number];
    /** Visible name of the budget; also names the meter. */
    label: string;
    /** Words for each state (i18n). */
    stateLabels?: Partial<BudgetStateLabels>;
    /** Text templates for the amount, committed and overage lines (i18n). */
    messages?: Partial<BudgetMessages>;
    /** Overrides the meter's accessible name (defaults to `label`). */
    ariaLabel?: string;
  } = $props();

  const labelId = `cy-budget-${Math.random().toString(36).slice(2, 9)}`;

  let minorUnits = $derived(currencyMinorUnits(currency, locale));
  let metrics = $derived(computeBudget({ spent, limit, committed }, minorUnits, thresholds));
  let words = $derived({ ...DEFAULT_STATE_LABELS, ...stateLabels });
  let text = $derived({ ...DEFAULT_BUDGET_MESSAGES, ...messages });

  function money(value: string): string {
    return formatMoney(value, { currency, locale });
  }

  let amountText = $derived(text.amount(money(metrics.spent.value), money(metrics.limit.value)));
  let committedText = $derived(metrics.committed ? text.committed(money(metrics.committed.value)) : "");
  let overageText = $derived(metrics.overage ? text.overage(money(metrics.overage)) : "");
  let stateText = $derived(words[metrics.state]);
  let valueText = $derived([amountText, committedText, overageText, stateText].filter(Boolean).join(", "));
</script>

{#snippet stateIcon(state: BudgetState)}
  <svg class="cy-budget__icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
    {#if state === "ok"}
      <circle cx="8" cy="8" r="6.25" /><path d="M5.25 8.25 7 10l3.75-4" />
    {:else if state === "approaching"}
      <path d="M8 1.75 14.5 13.5h-13z" /><path d="M8 6.25v3M8 11.5h.01" />
    {:else}
      <circle cx="8" cy="8" r="6.25" /><path d="M5.75 5.75l4.5 4.5M10.25 5.75l-4.5 4.5" />
    {/if}
  </svg>
{/snippet}

<div class="cy-budget cy-budget--{metrics.state}">
  <div class="cy-budget__header">
    <span class="cy-budget__label" id={labelId}>{label}</span>
    <span class="cy-budget__state">
      {@render stateIcon(metrics.state)}
      {stateText}
    </span>
  </div>
  <div
    class="cy-budget__track"
    role="meter"
    aria-label={ariaLabel || undefined}
    aria-labelledby={ariaLabel ? undefined : labelId}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(metrics.spentPercent)}
    aria-valuetext={valueText}
  >
    <div class="cy-budget__spent" style:width="{metrics.spentPercent}%"></div>
    {#if metrics.committed}
      <div class="cy-budget__committed" style:width="{metrics.committedPercent}%"></div>
    {/if}
  </div>
  <div class="cy-budget__footer">
    <span class="cy-budget__amount">{amountText}</span>
    {#if committedText}<span class="cy-budget__committed-text">{committedText}</span>{/if}
    {#if overageText}<span class="cy-budget__overage">{overageText}</span>{/if}
  </div>
</div>

<style>
  .cy-budget {
    --cy-budget-fill: var(--color-state-success);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    font-family: var(--font-body);
    color: var(--color-text-primary);
  }

  .cy-budget--approaching {
    --cy-budget-fill: var(--color-state-warning);
  }

  .cy-budget--exceeded {
    --cy-budget-fill: var(--color-state-error);
  }

  .cy-budget__header,
  .cy-budget__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .cy-budget__label {
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
  }

  .cy-budget__state {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-size: 0.8125rem;
    color: var(--cy-budget-fill);
  }

  .cy-budget__icon {
    flex-shrink: 0;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .cy-budget__track {
    display: flex;
    height: 8px;
    overflow: hidden;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-pill);
  }

  .cy-budget__spent,
  .cy-budget__committed {
    height: 100%;
    transition: width var(--transition-slow);
  }

  .cy-budget__spent {
    background: var(--cy-budget-fill);
  }

  /* Committed is striped and translucent, so it never relies on colour alone. */
  .cy-budget__committed {
    background: repeating-linear-gradient(
      -45deg,
      var(--cy-budget-fill) 0 2px,
      transparent 2px 5px
    );
    opacity: 0.7;
  }

  .cy-budget__footer {
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-secondary);
  }

  .cy-budget__overage {
    font-weight: var(--font-weight-semibold);
    color: var(--color-state-error);
  }
</style>
