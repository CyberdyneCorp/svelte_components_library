<svelte:options runes={true} />

<script lang="ts">
  let {
    id,
    title,
    progress = 0,
    votesFor = 0,
    votesAgainst = 0,
    date,
    status = "active",
    onClick,
  }: {
    id: string | number;
    title: string;
    progress?: number;
    votesFor?: number;
    votesAgainst?: number;
    date?: string;
    status?: "active" | "passed" | "rejected" | "pending";
    onClick?: (id: string | number) => void;
  } = $props();

  let clamped = $derived(Math.max(0, Math.min(100, progress)));
</script>

<button
  class="cy-prow cy-prow--{status}"
  type="button"
  aria-label="Proposal {id}: {title}"
  onclick={() => onClick?.(id)}
>
  <div class="cy-prow__top">
    <span class="cy-prow__title">#{id}: {title}</span>
    <span class="cy-prow__pct" data-testid="cy-prow-pct">{clamped}%</span>
  </div>
  <div class="cy-prow__meta">
    <span class="cy-prow__for" aria-label="Votes in favor">↑ {votesFor.toLocaleString()}</span>
    <span class="cy-prow__against" aria-label="Votes against">↓ {votesAgainst.toLocaleString()}</span>
    {#if date}<span class="cy-prow__date">{date}</span>{/if}
  </div>
  <div
    class="cy-prow__bar"
    role="progressbar"
    aria-valuenow={clamped}
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div class="cy-prow__fill" style:width="{clamped}%"></div>
  </div>
</button>

<style>
  .cy-prow {
    display: block;
    width: 100%;
    text-align: left;
    background: var(--color-surface-default, #fff);
    border: 2px solid var(--color-text-primary, #12121a);
    padding: 8px 10px;
    font-family: var(--font-body, monospace);
    color: var(--color-text-primary, #12121a);
    cursor: pointer;
  }
  .cy-prow:hover { background: var(--color-surface-hover, #ebebf0); }
  .cy-prow__top { display: flex; justify-content: space-between; font-weight: 700; font-size: 0.85rem; }
  .cy-prow__meta { display: flex; gap: 10px; font-size: 0.75rem; color: var(--color-text-secondary, #4a4a5c); margin: 4px 0 6px; }
  .cy-prow__for { color: var(--color-state-success, #00b32d); }
  .cy-prow__against { color: var(--color-state-error, #ff4444); }
  .cy-prow__date { margin-left: auto; }
  .cy-prow__bar { height: 6px; background: var(--color-border-subtle, #e0e0e8); border: 1px solid var(--color-text-primary, #12121a); }
  .cy-prow__fill { height: 100%; background: var(--color-action-brand-default, #00b32d); }
  .cy-prow--passed .cy-prow__fill { background: var(--color-state-success, #00b32d); }
  .cy-prow--rejected .cy-prow__fill { background: var(--color-state-error, #ff4444); }
  .cy-prow--pending .cy-prow__fill { background: var(--color-text-tertiary, #6a6a7e); }
</style>
