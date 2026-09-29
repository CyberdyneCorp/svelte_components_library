<svelte:options runes={true} />

<!--
  Story helper: a full futures terminal driven by one simulated feed. The
  ticker, book and tape come from `createMarketFeed`; the chart's last bar
  follows the feed's last price; orders from the ticket fill against the feed
  (terminalSim.ts) into positions and open orders, whose entry / TP / SL /
  liquidation prices are drawn on the chart. Dragging TP / SL (or L, ↑/↓,
  Enter on the focused chart) moves them.
-->
<script lang="ts">
  import TradingChart from "../trading/chart/TradingChart.svelte";
  import type { IndicatorConfig } from "../trading/chart/types.js";
  import OrderBook from "../trading/market/OrderBook.svelte";
  import RecentTrades from "../trading/market/RecentTrades.svelte";
  import TickerBar from "../trading/market/TickerBar.svelte";
  import OpenOrdersTable from "../trading/order/OpenOrdersTable.svelte";
  import OrderTicket from "../trading/order/OrderTicket.svelte";
  import PositionsTable from "../trading/order/PositionsTable.svelte";
  import type { OpenOrder, OrderDraft, OrderType, Position, Side } from "../trading/types.js";
  import { createMarketFeed, demoMarket } from "./marketFeed.js";
  import {
    alignCandles,
    availableMargin,
    cancelOrder,
    closePosition,
    demoLiquidation,
    fillMarkers,
    moveProtection,
    positionLines,
    seedAccount,
    submitOrder,
    tickAccount,
    tickCandles,
  } from "./terminalSim.js";
  import { marketCandles } from "./tradingData.js";

  let { tickMs = 1000, balance = "10000" }: { tickMs?: number; balance?: string } = $props();

  const MINUTE = 60_000;
  const market = demoMarket;
  const markets = { [market.symbol]: market };
  const sideNames: Record<Side, string> = { long: "Long", short: "Short" };
  const indicators: IndicatorConfig[] = [
    { type: "ema", period: 9 },
    { type: "ema", period: 21 },
    { type: "sma", period: 200 },
    { type: "bollinger", period: 20, stdDev: 2 },
    { type: "rsi", period: 14, pane: "rsi" },
    { type: "macd", pane: "macd" },
  ];

  const start = Math.floor(Date.now() / MINUTE) * MINUTE;
  const feed = createMarketFeed({ start });
  const initial = feed.current();
  const history = alignCandles(
    marketCandles(300, { interval: MINUTE, end: start, seed: 5, volatility: 0.0015 }),
    Number(initial.ticker.last),
  );
  let snapshot = $state.raw(initial);
  let candles = $state.raw(history);
  let account = $state.raw(seedAccount(market, history, initial.ticker.last, start));
  let running = $state(true);

  // Ticket fields the terminal drives: a book click fills the price.
  let price = $state<string | null>(null);
  let type = $state<OrderType>("limit");
  let side = $state<Side>("long");

  let last = $derived(snapshot.ticker.last);
  let mark = $derived(snapshot.ticker.mark ?? last);
  let priceLines = $derived(positionLines(account.positions, sideNames));
  let markers = $derived(fillMarkers(account.fills));
  let available = $derived(availableMargin(balance, account.positions));

  let width = $state(1200);
  let chartHeight = $derived(width >= 1200 ? 760 : width >= 720 ? 540 : 420);

  function step() {
    const before = snapshot.trades[0]?.id;
    snapshot = feed.next();
    const now = Date.now();
    const printed = snapshot.trades.slice(0, Math.max(0, snapshot.trades.findIndex((t) => t.id === before)));
    const volume = printed.reduce((sum, t) => sum + Number(t.size), 0);
    candles = tickCandles(candles, Number(snapshot.ticker.last), volume, now, MINUTE);
    account = tickAccount(account, snapshot.ticker.last, snapshot.ticker.mark ?? snapshot.ticker.last, now);
  }

  $effect(() => {
    if (!running) return;
    const timer = setInterval(step, tickMs);
    return () => clearInterval(timer);
  });

  function onpriceclick(level: string) {
    price = level;
    type = "limit";
  }

  function onsubmit(draft: OrderDraft) {
    account = submitOrder(account, draft, last, Date.now());
  }

  function onclose(position: Position, kind: "market" | "limit") {
    account = closePosition(account, position, kind, last, mark, Date.now());
  }

  function oncancel(order: OpenOrder) {
    account = cancelOrder(account, order.id);
  }

  function oncancelall() {
    account = account.orders.reduce((next, order) => cancelOrder(next, order.id), account);
  }

  function onpricelinechange(id: string, value: number) {
    account = moveProtection(account, id, value);
  }

  function estimateLiquidation(draft: OrderDraft) {
    const entry = draft.price ?? mark;
    return demoLiquidation(draft.side, entry, draft.leverage, market);
  }
</script>

<div class="terminal" bind:clientWidth={width}>
  <div class="terminal__ticker">
    <TickerBar ticker={snapshot.ticker} {market} locale="en-US" />
    <button type="button" class="terminal__pause" aria-pressed={!running} onclick={() => (running = !running)}>
      {running ? "Pause feed" : "Resume feed"}
    </button>
  </div>

  <div class="terminal__chart">
    <TradingChart
      {candles}
      {market}
      {indicators}
      {markers}
      {priceLines}
      {onpricelinechange}
      interval="1m"
      locale="en-US"
      height={chartHeight}
      paneHeights={{ main: 4, rsi: 1, macd: 1 }}
    />
  </div>

  <div class="terminal__book">
    <OrderBook bids={snapshot.bids} asks={snapshot.asks} {market} levels={8} locale="en-US" {onpriceclick} />
  </div>

  <div class="terminal__trades">
    <RecentTrades trades={snapshot.trades} {market} locale="en-US" timeZone="UTC" height={260} />
  </div>

  <div class="terminal__ticket">
    <OrderTicket
      {market}
      {available}
      referencePrice={mark}
      makerFee="0.0002"
      takerFee="0.0005"
      {estimateLiquidation}
      {onsubmit}
      locale="en-US"
      bind:price
      bind:type
      bind:side
    />
  </div>

  <div class="terminal__account">
    <PositionsTable positions={account.positions} {markets} locale="en-US" {onclose} />
    <OpenOrdersTable orders={account.orders} {markets} locale="en-US" {oncancel} {oncancelall} />
  </div>
</div>

<style>
  /* Phone first: one column in reading order (ticker, chart, ticket, book, tape, account). */
  .terminal {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "ticker"
      "chart"
      "ticket"
      "book"
      "trades"
      "account";
    gap: var(--space-3);
    min-width: 0;
  }

  .terminal > * {
    min-width: 0;
  }

  .terminal__ticker {
    grid-area: ticker;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
  }

  /* The ticker takes the row; on a phone the pause button wraps below it. */
  .terminal__ticker > :global(:first-child) {
    flex: 1 1 24rem;
    min-width: 0;
  }

  .terminal__chart {
    grid-area: chart;
  }

  .terminal__book {
    grid-area: book;
  }

  .terminal__trades {
    grid-area: trades;
  }

  .terminal__ticket {
    grid-area: ticket;
  }

  .terminal__account {
    grid-area: account;
    display: grid;
    gap: var(--space-3);
    overflow-x: auto;
  }

  .terminal__pause {
    flex: none;
    font: inherit;
    font-size: 0.75rem;
    padding: var(--space-1) var(--space-3);
    color: var(--color-text-primary);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .terminal__pause:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  /* Tablet: chart full width, then book | tape | ticket. */
  @media (min-width: 720px) {
    .terminal {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-areas:
        "ticker ticker ticker"
        "chart chart chart"
        "book trades ticket"
        "account account account";
    }
  }

  /* Desktop: chart | book + tape | ticket, account tables below. */
  @media (min-width: 1200px) {
    .terminal {
      grid-template-columns: minmax(0, 1fr) 17rem 19rem;
      grid-template-areas:
        "ticker ticker ticker"
        "chart book ticket"
        "chart trades ticket"
        "account account account";
    }
  }
</style>
