<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let {
    now = $bindable<Date | null>(null),
    showDate = false,
    showSeconds = false,
    hour12 = false,
    locale = undefined as string | undefined,
    tickIntervalMs = 1000,
  }: {
    now?: Date | null;
    showDate?: boolean;
    showSeconds?: boolean;
    hour12?: boolean;
    locale?: string;
    tickIntervalMs?: number;
  } = $props();

  let internal = $state(now ?? new Date());
  let timer: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    if (now !== null) return;
    timer = setInterval(() => { internal = new Date(); }, tickIntervalMs);
  });
  onDestroy(() => { if (timer) clearInterval(timer); });

  let current = $derived(now ?? internal);
  let timeStr = $derived(current.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12,
  }));
  let dateStr = $derived(current.toLocaleDateString(locale));
</script>

<div class="cy-clock" role="timer" aria-label="Clock">
  <span class="cy-clock__time" data-testid="cy-clock-time">{timeStr}</span>
  {#if showDate}
    <span class="cy-clock__date" data-testid="cy-clock-date">{dateStr}</span>
  {/if}
</div>

<style>
  .cy-clock {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: var(--color-surface-default, #fff);
    border: 2px solid var(--color-text-primary, #12121a);
    font-family: "Courier New", monospace;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--color-text-primary, #12121a);
  }
  .cy-clock__date { font-weight: 400; color: var(--color-text-secondary, #4a4a5c); }
</style>
