<svelte:options runes={true} />

<script lang="ts">
  import type { StatCardRow } from "./types.js";

  let {
    icon,
    title,
    primary,
    primaryAccent = "default",
    rows = [],
  }: {
    icon?: string;
    title: string;
    primary?: string | number;
    primaryAccent?: "default" | "brand" | "info" | "success" | "danger";
    rows?: StatCardRow[];
  } = $props();
</script>

<section class="cy-statcard" aria-label={title}>
  <header class="cy-statcard__header">
    {#if icon}<span class="cy-statcard__icon" aria-hidden="true">{icon}</span>{/if}
    <h3 class="cy-statcard__title">{title}</h3>
  </header>
  {#if primary !== undefined}
    <div class="cy-statcard__primary cy-statcard__primary--{primaryAccent}" data-testid="cy-statcard-primary">{primary}</div>
  {/if}
  {#if rows.length > 0}
    <dl class="cy-statcard__rows">
      {#each rows as row (row.label)}
        <div class="cy-statcard__row">
          <dt>{row.label}</dt>
          <dd class="cy-statcard__val cy-statcard__val--{row.accent ?? 'default'}">{row.value}</dd>
        </div>
      {/each}
    </dl>
  {/if}
</section>

<style>
  .cy-statcard {
    background: var(--color-surface-default, #fff);
    border: 2px solid var(--color-text-primary, #12121a);
    padding: 10px 12px;
    font-family: var(--font-body, monospace);
    color: var(--color-text-primary, #12121a);
  }
  .cy-statcard__header {
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 2px dashed var(--color-border-default, #d0d0da);
    padding-bottom: 6px;
    margin-bottom: 8px;
  }
  .cy-statcard__title { margin: 0; font-size: 0.85rem; font-weight: 700; }
  .cy-statcard__icon { font-size: 1rem; }
  .cy-statcard__primary {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 4px 0;
  }
  .cy-statcard__primary--brand { color: var(--color-action-brand-default, #00b32d); }
  .cy-statcard__primary--info { color: var(--color-action-secondary-default, #00aacc); }
  .cy-statcard__primary--success { color: var(--color-state-success, #00b32d); }
  .cy-statcard__primary--danger { color: var(--color-state-error, #ff4444); }
  .cy-statcard__rows { margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
  .cy-statcard__row { display: flex; justify-content: space-between; font-size: 0.8rem; }
  .cy-statcard__row dt { color: var(--color-text-secondary, #4a4a5c); margin: 0; }
  .cy-statcard__row dd { margin: 0; font-weight: 600; }
  .cy-statcard__val--brand { color: var(--color-action-brand-default, #00b32d); }
  .cy-statcard__val--info { color: var(--color-action-secondary-default, #00aacc); }
  .cy-statcard__val--success { color: var(--color-state-success, #00b32d); }
  .cy-statcard__val--danger { color: var(--color-state-error, #ff4444); }
</style>
