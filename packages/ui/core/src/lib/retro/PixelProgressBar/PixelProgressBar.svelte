<svelte:options runes={true} />

<script lang="ts">
  let {
    value = 0,
    max = 100,
    segments = 10,
    variant = "brand",
    showLabel = false,
    label,
    ariaLabel = "Progress",
  }: {
    value?: number;
    max?: number;
    segments?: number;
    variant?: "brand" | "info" | "success" | "warning" | "danger";
    showLabel?: boolean;
    label?: string;
    ariaLabel?: string;
  } = $props();

  let pct = $derived(max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0);
  let filled = $derived(Math.round((pct / 100) * segments));
</script>

<div class="cy-pbar" role="progressbar" aria-label={ariaLabel} aria-valuenow={value} aria-valuemin="0" aria-valuemax={max}>
  <div class="cy-pbar__track cy-pbar--{variant}">
    {#each Array(segments) as _, i (i)}
      <span class="cy-pbar__seg" class:cy-pbar__seg--on={i < filled}></span>
    {/each}
  </div>
  {#if showLabel}
    <span class="cy-pbar__label" data-testid="cy-pbar-label">{label ?? `${Math.round(pct)}%`}</span>
  {/if}
</div>

<style>
  .cy-pbar { display: flex; align-items: center; gap: 8px; font-family: var(--font-body, monospace); }
  .cy-pbar__track { display: flex; gap: 2px; flex: 1; padding: 2px; background: var(--color-surface-raised, #f5f5fa); border: 2px solid var(--color-text-primary, #12121a); }
  .cy-pbar__seg { flex: 1; height: 10px; background: transparent; }
  .cy-pbar--brand .cy-pbar__seg--on { background: var(--color-action-brand-default, #00b32d); }
  .cy-pbar--info .cy-pbar__seg--on { background: var(--color-action-secondary-default, #00aacc); }
  .cy-pbar--success .cy-pbar__seg--on { background: var(--color-state-success, #00b32d); }
  .cy-pbar--warning .cy-pbar__seg--on { background: var(--color-state-warning, #ffb800); }
  .cy-pbar--danger .cy-pbar__seg--on { background: var(--color-state-error, #ff4444); }
  .cy-pbar__label { font-size: 0.75rem; font-weight: 700; min-width: 40px; text-align: right; }
</style>
