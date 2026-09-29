<svelte:options runes={true} />

<!-- Story helper: switches data-theme on <html>; the chart repaints without remounting. -->
<script lang="ts">
  import TradingChart from "../trading/chart/TradingChart.svelte";
  import { BTC_PERP, marketCandles } from "./tradingData.js";

  const themes = ["dark", "light", "calm", "vaporwave", "brutalism"];
  const candles = marketCandles(200, { seed: 5 });
  let current = $state(
    typeof document === "undefined" ? "dark" : (document.documentElement.getAttribute("data-theme") ?? "dark"),
  );

  function apply(theme: string) {
    current = theme;
    document.documentElement.setAttribute("data-theme", theme);
  }
</script>

<div class="themes" role="group" aria-label="Theme">
  {#each themes as theme (theme)}
    <button type="button" aria-pressed={current === theme} onclick={() => apply(theme)}>{theme}</button>
  {/each}
</div>
<TradingChart
  {candles}
  market={BTC_PERP}
  indicators={[{ type: "bollinger" }, { type: "macd" }]}
  height={380}
/>

<style>
  .themes {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .themes button {
    font: inherit;
    font-size: 0.75rem;
    padding: var(--space-1) var(--space-3);
    color: var(--color-text-primary);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .themes button[aria-pressed="true"] {
    border-color: var(--color-border-focus);
  }
</style>
