<svelte:options runes={true} />

<!-- Story helper: trade markers plus draggable TP / SL lines kept in state. -->
<script lang="ts">
  import TradingChart from "../trading/chart/TradingChart.svelte";
  import type { ChartMarker, PriceLine } from "../trading/types.js";
  import { BTC_PERP, marketCandles } from "./tradingData.js";

  const candles = marketCandles(300, { seed: 3 });
  const entryBar = candles[250];
  const exitBar = candles[280];
  const entry = Math.round(entryBar.close * 2) / 2;

  const markers: ChartMarker[] = [
    { time: entryBar.time, position: "below", shape: "arrow-up", text: "Long", id: "entry" },
    { time: exitBar.time, position: "above", shape: "arrow-down", text: "Close", id: "exit" },
    { time: candles[200].time, position: "at", shape: "circle", color: "var(--color-accent-violet)" },
  ];

  let priceLines = $state<PriceLine[]>([
    { id: "entry", price: entry, kind: "entry" },
    { id: "tp", price: Math.round(entry * 1.02 * 2) / 2, kind: "take-profit", draggable: true },
    { id: "sl", price: Math.round(entry * 0.985 * 2) / 2, kind: "stop-loss", draggable: true },
    { id: "liq", price: Math.round(entry * 0.95 * 2) / 2, kind: "liquidation" },
  ]);

  function onpricelinechange(id: string, price: number) {
    priceLines = priceLines.map((line) => (line.id === id ? { ...line, price } : line));
  }

  let summary = $derived(
    priceLines
      .filter((line) => line.draggable)
      .map((line) => `${line.kind === "take-profit" ? "TP" : "SL"} ${line.price}`)
      .join(" · "),
  );
</script>

<p class="note">Drag the TP / SL lines; prices snap to the 0.5 tick. {summary}</p>
<TradingChart {candles} market={BTC_PERP} {markers} {priceLines} {onpricelinechange} volume="none" />

<style>
  .note {
    margin: 0 0 var(--space-2);
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }
</style>
