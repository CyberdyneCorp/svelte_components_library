<svelte:options runes={true} />

<!-- Story helper: a simulated feed revising the last bar and appending bars. -->
<script lang="ts">
  import { untrack } from "svelte";
  import TradingChart from "../trading/chart/TradingChart.svelte";
  import type { IndicatorConfig } from "../trading/chart/types.js";
  import { BTC_PERP, marketCandles, nextTick, seeded } from "./tradingData.js";

  let { tickMs = 250, count = 600 }: { tickMs?: number; count?: number } = $props();

  let candles = $state.raw(untrack(() => marketCandles(count)));
  let running = $state(true);
  let lastUpdateMs = $state(0);
  const indicators: IndicatorConfig[] = [
    { type: "ema", period: 21 },
    { type: "rsi", period: 14 },
  ];

  $effect(() => {
    if (!running) return;
    const random = seeded(11);
    let tick = 1;
    const timer = setInterval(() => {
      const next = nextTick(candles, tick++, random);
      const start = performance.now();
      candles = next;
      lastUpdateMs = performance.now() - start;
    }, tickMs);
    return () => clearInterval(timer);
  });
</script>

<div class="demo">
  <button type="button" onclick={() => (running = !running)}>{running ? "Pause feed" : "Resume feed"}</button>
  <span class="demo__note">Last prop update: {lastUpdateMs.toFixed(2)} ms · {candles.length} bars</span>
</div>
<TradingChart {candles} market={BTC_PERP} {indicators} interval="1h" />

<style>
  .demo {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    margin-bottom: var(--space-2);
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .demo button {
    font: inherit;
    padding: var(--space-1) var(--space-3);
    color: var(--color-text-primary);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
</style>
