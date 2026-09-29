<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import { formatPrice, formatSize } from "../format.js";
  import type { MarketSpec, Trade } from "../types.js";
  import { coalesced } from "./coalesced.svelte.js";
  import { prefersReducedMotion } from "./display.js";
  import { DEFAULT_RECENT_TRADES_LABELS, type RecentTradesLabels } from "./labels.js";
  import { freshTradeIds, listWindow, newestFirst } from "./trades.js";

  let {
    trades = [],
    market,
    locale,
    timeZone,
    height = 320,
    rowHeight = 24,
    overscan = 8,
    labels = {},
    class: className = "",
  }: {
    /** Trades in any order; shown newest first. */
    trades?: Trade[];
    market: Pick<MarketSpec, "tickSize" | "stepSize" | "baseAsset" | "quoteAsset"> &
      Partial<Pick<MarketSpec, "pricePrecision" | "sizePrecision">>;
    locale?: string;
    /** IANA time zone for the time column; defaults to the user's zone. */
    timeZone?: string;
    /** Height of the scrolling list in px. */
    height?: number;
    /** Fixed row height in px (the list is windowed). */
    rowHeight?: number;
    /** Extra rows rendered above and below the viewport. */
    overscan?: number;
    labels?: Partial<RecentTradesLabels>;
    class?: string;
  } = $props();

  const L = $derived({ ...DEFAULT_RECENT_TRADES_LABELS, ...labels });
  const feed = coalesced(() => trades);
  const list = $derived(newestFirst(feed.current));

  let reducedMotion = $state(true);
  onMount(() => {
    reducedMotion = prefersReducedMotion();
  });

  // Ids seen on the previous render; the first render highlights nothing.
  let seen: ReadonlySet<string> | null = null;
  const fresh = $derived.by(() => {
    const ids = new Set(list.map((trade) => trade.id));
    const result = seen && !reducedMotion ? freshTradeIds(seen, list) : new Set<string>();
    seen = ids;
    return result;
  });

  let scrollTop = $state(0);
  const view = $derived(listWindow(list.length, scrollTop, height, rowHeight, overscan));
  const visible = $derived(list.slice(view.start, view.end));

  const timeFormat = $derived(
    new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
      timeZone,
    }),
  );
</script>

<div class="cy-rt {className}">
  <div class="cy-rt__head" aria-hidden="true">
    <span>{L.price} ({market.quoteAsset})</span>
    <span class="cy-rt__num">{L.size} ({market.baseAsset})</span>
    <span class="cy-rt__num">{L.time}</span>
  </div>

  {#if list.length === 0}
    <p class="cy-rt__empty">{L.empty}</p>
  {:else}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (scrollable region must be keyboard-reachable) -->
    <div
      class="cy-rt__scroll"
      role="region"
      aria-label={L.title}
      tabindex="0"
      style:height="{height}px"
      onscroll={(event) => (scrollTop = event.currentTarget.scrollTop)}
    >
      <ol class="cy-rt__list" style:padding-top="{view.padTop}px" style:padding-bottom="{view.padBottom}px">
        {#each visible as trade, i (trade.id)}
          <li
            class="cy-rt__row cy-rt__row--{trade.side}"
            class:cy-rt__row--new={fresh.has(trade.id)}
            style:height="{rowHeight}px"
            aria-setsize={list.length}
            aria-posinset={view.start + i + 1}
          >
            <span class="cy-rt__price">
              <span class="cy-rt__glyph" role="img" aria-label={trade.side === "buy" ? L.buy : L.sell}
                >{trade.side === "buy" ? "▲" : "▼"}</span
              >
              {formatPrice(trade.price, market, locale)}
            </span>
            <span class="cy-rt__num">{formatSize(trade.size, market, locale)}</span>
            <time class="cy-rt__num" datetime={new Date(trade.time).toISOString()}>
              {timeFormat.format(trade.time)}
            </time>
          </li>
        {/each}
      </ol>
    </div>
  {/if}
</div>

<style>
  .cy-rt {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 16rem;
    padding: var(--space-2);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
  }

  .cy-rt__head,
  .cy-rt__row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: var(--space-2);
    align-items: center;
    padding: 0 var(--space-2);
  }

  .cy-rt__head {
    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }

  .cy-rt__num {
    text-align: end;
  }

  .cy-rt__scroll {
    overflow-y: auto;
    scrollbar-width: thin;
  }

  .cy-rt__scroll:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-rt__list {
    list-style: none;
    margin: 0;
    padding-inline: 0;
  }

  .cy-rt__row {
    box-sizing: border-box;
    border-radius: var(--radius-xs);
  }

  .cy-rt__row--buy .cy-rt__price {
    color: var(--color-trade-long-text);
  }

  .cy-rt__row--sell .cy-rt__price {
    color: var(--color-trade-short-text);
  }

  .cy-rt__glyph {
    display: inline-block;
    width: 1em;
    font-size: 0.75em;
  }

  .cy-rt__row--new.cy-rt__row--buy {
    animation: cy-rt-flash-buy 0.8s ease-out;
  }

  .cy-rt__row--new.cy-rt__row--sell {
    animation: cy-rt-flash-sell 0.8s ease-out;
  }

  @keyframes cy-rt-flash-buy {
    from {
      background: var(--color-trade-long-bg);
    }
  }

  @keyframes cy-rt-flash-sell {
    from {
      background: var(--color-trade-short-bg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cy-rt__row--new.cy-rt__row--buy,
    .cy-rt__row--new.cy-rt__row--sell {
      animation: none;
    }
  }

  .cy-rt__empty {
    margin: 0;
    padding: var(--space-2);
    color: var(--color-text-secondary);
    text-align: center;
  }
</style>
