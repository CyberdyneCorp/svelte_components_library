<svelte:options runes={true} />

<script lang="ts">
  let {
    min,
    max,
    current,
    lower,
    upper,
    showLabels = true,
    precision = 4,
    ariaLabel = "Liquidity range",
  }: {
    min: number;
    max: number;
    current: number;
    lower: number;
    upper: number;
    showLabels?: boolean;
    precision?: number;
    ariaLabel?: string;
  } = $props();

  function pct(v: number): number {
    if (max <= min) return 0;
    return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  }

  const inRange = $derived(current >= lower && current <= upper);
  const leftPct = $derived(pct(lower));
  const rightPct = $derived(pct(upper));
  const curPct = $derived(pct(current));
  const fmt = (v: number) => v.toFixed(precision);
</script>

<div class="cy-lrange" role="group" aria-label={ariaLabel}>
  {#if showLabels}
    <div class="cy-lrange__meta">
      <span class="cy-lrange__status" class:cy-lrange__status--in={inRange} class:cy-lrange__status--out={!inRange}>
        {inRange ? "In Range" : "Out of Range"}
      </span>
      <span class="cy-lrange__current" data-testid="cy-lrange-current">
        {fmt(current)} <span class="cy-lrange__bounds">({fmt(lower)}-{fmt(upper)})</span>
      </span>
    </div>
  {/if}
  <div
    class="cy-lrange__track"
    role="progressbar"
    aria-valuenow={current}
    aria-valuemin={min}
    aria-valuemax={max}
  >
    <div
      class="cy-lrange__band"
      class:cy-lrange__band--in={inRange}
      class:cy-lrange__band--out={!inRange}
      style:left="{leftPct}%"
      style:width="{Math.max(0, rightPct - leftPct)}%"
      data-testid="cy-lrange-band"
    ></div>
    <div class="cy-lrange__marker" style:left="{curPct}%" data-testid="cy-lrange-marker" aria-hidden="true"></div>
  </div>
</div>

<style>
  .cy-lrange { font-family: var(--font-body, monospace); color: var(--color-text-primary, #12121a); }
  .cy-lrange__meta { display: flex; justify-content: space-between; font-size: 0.72rem; margin-bottom: 3px; }
  .cy-lrange__status--in { color: var(--color-state-success, #00b32d); font-weight: 700; }
  .cy-lrange__status--out { color: var(--color-state-error, #ff4444); font-weight: 700; }
  .cy-lrange__bounds { color: var(--color-text-tertiary, #6a6a7e); }
  .cy-lrange__track { position: relative; height: 8px; background: var(--color-surface-raised, #f5f5fa); border: 2px solid var(--color-text-primary, #12121a); }
  .cy-lrange__band { position: absolute; top: 0; bottom: 0; }
  .cy-lrange__band--in { background: var(--color-state-success, #00b32d); }
  .cy-lrange__band--out { background: var(--color-state-error, #ff4444); opacity: 0.55; }
  .cy-lrange__marker { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--color-text-primary, #12121a); transform: translateX(-50%); }
</style>
