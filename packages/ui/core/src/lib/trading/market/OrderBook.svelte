<svelte:options runes={true} />

<script lang="ts">
  import { formatPrice, formatSize } from "../format.js";
  import type { BookLevel, MarketSpec } from "../types.js";
  import {
    buildBook,
    defaultGroupingOptions,
    resolveGrouping,
    trimZeros,
    type BookRow,
    type BookSide,
    type OrderBookLayout,
  } from "./book.js";
  import { coalesced } from "./coalesced.svelte.js";
  import { isMultipleOf } from "./decimal.js";
  import { DEFAULT_ORDER_BOOK_LABELS, type OrderBookLabels } from "./labels.js";

  let {
    bids = [],
    asks = [],
    market,
    grouping = $bindable(),
    groupingOptions,
    levels = 12,
    layout = "both",
    locale,
    labels = {},
    onpriceclick,
    ongroupingchange,
    class: className = "",
  }: {
    /** Bid levels, best (highest) price first. Size "0" levels are ignored. */
    bids?: BookLevel[];
    /** Ask levels, best (lowest) price first. Size "0" levels are ignored. */
    asks?: BookLevel[];
    market: Pick<MarketSpec, "tickSize" | "stepSize" | "baseAsset" | "quoteAsset"> &
      Partial<Pick<MarketSpec, "pricePrecision" | "sizePrecision">>;
    /** Price bucket; a multiple of `tickSize`. Defaults to the tick size. */
    grouping?: string;
    /** Choices in the grouping control. Defaults to tick × 1, 10, 100, 1000. */
    groupingOptions?: string[];
    /** Levels shown per side. */
    levels?: number;
    layout?: OrderBookLayout;
    locale?: string;
    labels?: Partial<OrderBookLabels>;
    /** Called with the grouped level price when a level is activated. */
    onpriceclick?: (price: string) => void;
    ongroupingchange?: (grouping: string) => void;
    class?: string;
  } = $props();

  const L = $derived({ ...DEFAULT_ORDER_BOOK_LABELS, ...labels });
  const feed = coalesced(() => ({ bids, asks }));
  const step = $derived(resolveGrouping(grouping, market.tickSize));
  const options = $derived(
    (groupingOptions ?? defaultGroupingOptions(market.tickSize)).filter((option) =>
      isMultipleOf(option, market.tickSize),
    ),
  );
  const book = $derived(
    buildBook({ bids: feed.current.bids, asks: feed.current.asks, grouping: step, levels }),
  );
  const showAsks = $derived(layout !== "bids");
  const showBids = $derived(layout !== "asks");
  const percentFormat = $derived(
    new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 3, maximumFractionDigits: 3 }),
  );

  function price(value: string) {
    return formatPrice(value, market, locale);
  }

  function size(value: string) {
    return formatSize(value, market, locale);
  }

  function describe(side: BookSide, row: BookRow) {
    const name = side === "bid" ? L.bid : L.ask;
    return `${name} ${price(row.price)}, ${L.size} ${size(row.size)}, ${L.total} ${size(row.total)}`;
  }

  function selectGrouping(event: Event) {
    grouping = (event.currentTarget as HTMLSelectElement).value;
    ongroupingchange?.(grouping);
  }
</script>

{#snippet cells(side: BookSide, row: BookRow)}
  <span class="cy-ob__bar" style:width="{row.depth * 100}%" aria-hidden="true"></span>
  <span class="cy-ob__cells" aria-hidden="true">
    <span class="cy-ob__price cy-ob__price--{side}">{price(row.price)}</span>
    <span class="cy-ob__num">{size(row.size)}</span>
    <span class="cy-ob__num">{size(row.total)}</span>
  </span>
  <span class="cy-ob__sr">{describe(side, row)}</span>
{/snippet}

{#snippet sideList(side: BookSide, rows: BookRow[])}
  {#if rows.length === 0}
    <p class="cy-ob__empty">{side === "bid" ? L.bids : L.asks}: {L.empty}</p>
  {:else}
    <ul class="cy-ob__side cy-ob__side--{side}" aria-label={side === "bid" ? L.bids : L.asks}>
      {#each rows as row (row.price)}
        <li class="cy-ob__level">
          {#if onpriceclick}
            <button type="button" class="cy-ob__row" onclick={() => onpriceclick?.(row.price)}>
              {@render cells(side, row)}
            </button>
          {:else}
            <div class="cy-ob__row">{@render cells(side, row)}</div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
{/snippet}

<section class="cy-ob {className}" aria-label={L.title}>
  <div class="cy-ob__toolbar">
    <span class="cy-ob__title">{L.title}</span>
    {#if options.length > 1}
      <label class="cy-ob__grouping">
        <span>{L.grouping}</span>
        <select value={step} onchange={selectGrouping}>
          {#each options as option (option)}
            <option value={option}>{trimZeros(option)}</option>
          {/each}
        </select>
      </label>
    {/if}
  </div>

  <div class="cy-ob__head" aria-hidden="true">
    <span>{L.price} ({market.quoteAsset})</span>
    <span class="cy-ob__num">{L.size} ({market.baseAsset})</span>
    <span class="cy-ob__num">{L.total} ({market.baseAsset})</span>
  </div>

  {#if showAsks}
    {@render sideList("ask", layout === "both" ? [...book.asks].reverse() : book.asks)}
  {/if}

  {#if layout === "both"}
    <p class="cy-ob__spread" data-crossed={book.spread?.crossed || undefined}>
      <span>{L.spread}</span>
      {#if book.spread}
        <span class="cy-ob__num">{price(book.spread.absolute)}</span>
        <span class="cy-ob__num">({percentFormat.format(book.spread.percent / 100)})</span>
        {#if book.spread.crossed}<span class="cy-ob__crossed">{L.crossed}</span>{/if}
      {:else}
        <span class="cy-ob__num">—</span>
      {/if}
    </p>
  {/if}

  {#if showBids}
    {@render sideList("bid", book.bids)}
  {/if}
</section>

<style>
  .cy-ob {
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

  .cy-ob__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .cy-ob__title {
    font-family: var(--font-body);
    font-weight: var(--font-weight-semibold);
  }

  .cy-ob__grouping {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--color-text-secondary);
  }

  .cy-ob__grouping select {
    font: inherit;
    color: var(--color-text-primary);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-sm);
    padding: 0 var(--space-1);
  }

  .cy-ob__head,
  .cy-ob__cells {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-2);
  }

  .cy-ob__head {
    padding: 0 var(--space-2);
    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }

  .cy-ob__num {
    text-align: end;
  }

  .cy-ob__side {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cy-ob__row {
    position: relative;
    display: block;
    width: 100%;
    padding: 0.125rem var(--space-2);
    font: inherit;
    color: inherit;
    text-align: start;
    background: transparent;
    border: 0;
    border-radius: var(--radius-xs);
  }

  button.cy-ob__row {
    cursor: pointer;
  }

  button.cy-ob__row:hover {
    background: var(--color-surface-hover);
  }

  button.cy-ob__row:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: -2px;
  }

  .cy-ob__cells {
    position: relative;
  }

  .cy-ob__bar {
    position: absolute;
    inset-block: 0;
    inset-inline-end: 0;
    max-width: 100%;
    pointer-events: none;
  }

  .cy-ob__side--bid .cy-ob__bar {
    background: var(--color-trade-long-bg);
  }

  .cy-ob__side--ask .cy-ob__bar {
    background: var(--color-trade-short-bg);
  }

  .cy-ob__price--bid {
    color: var(--color-trade-long-text);
  }

  .cy-ob__price--ask {
    color: var(--color-trade-short-text);
  }

  .cy-ob__spread {
    display: flex;
    gap: var(--space-2);
    align-items: baseline;
    margin: 0;
    padding: var(--space-1) var(--space-2);
    color: var(--color-text-secondary);
    border-block: 1px solid var(--color-border-subtle);
  }

  .cy-ob__crossed {
    margin-inline-start: auto;
    color: var(--color-trade-short-text);
    font-weight: var(--font-weight-semibold);
  }

  .cy-ob__empty {
    margin: 0;
    padding: var(--space-2);
    color: var(--color-text-secondary);
    text-align: center;
  }

  .cy-ob__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
</style>
