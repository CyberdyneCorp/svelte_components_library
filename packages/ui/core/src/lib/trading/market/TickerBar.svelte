<svelte:options runes={true} />

<script lang="ts">
  import { formatPrice } from "../format.js";
  import type { MarketSpec, Ticker } from "../types.js";
  import { coalesced } from "./coalesced.svelte.js";
  import {
    directionOf,
    formatCompact,
    formatCountdown,
    formatFundingRate,
    formatPercent,
    formatSignedPrice,
    GLYPH,
  } from "./display.js";
  import { DEFAULT_TICKER_BAR_LABELS, type TickerBarLabels } from "./labels.js";

  let {
    ticker,
    market,
    locale,
    labels = {},
    class: className = "",
  }: {
    /**
     * Current market summary. `changePct24h` is in percent ("2.35" = 2.35 %);
     * `fundingRate` is a fraction ("0.0001" = 0.01 %). Absent fields are not shown.
     */
    ticker: Ticker;
    market: Pick<MarketSpec, "tickSize" | "baseAsset" | "quoteAsset"> &
      Partial<Pick<MarketSpec, "symbol" | "pricePrecision">>;
    locale?: string;
    labels?: Partial<TickerBarLabels>;
    class?: string;
  } = $props();

  const L = $derived({ ...DEFAULT_TICKER_BAR_LABELS, ...labels });
  const feed = coalesced(() => ticker);
  const t = $derived(feed.current);
  const direction = $derived(directionOf(t.change24h ?? t.changePct24h));
  const directionLabel = $derived(direction === "up" ? L.up : L.down);

  let now = $state(Date.now());
  $effect(() => {
    if (t.nextFundingTime === undefined) return;
    now = Date.now();
    const timer = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(timer);
  });

  function price(value: string) {
    return formatPrice(value, market, locale);
  }

  function change() {
    const parts: string[] = [];
    if (t.change24h !== undefined) parts.push(formatSignedPrice(t.change24h, market, locale));
    if (t.changePct24h !== undefined) parts.push(formatPercent(t.changePct24h, locale));
    return parts.join(" ");
  }

  interface Field {
    key: string;
    label: string;
    value: string;
  }

  /** Plain label/value fields, in display order; absent values are skipped. */
  const fields = $derived.by(() => {
    const all: [string, string, string | undefined, (value: string) => string][] = [
      ["mark", L.mark, t.mark, price],
      ["index", L.index, t.index, price],
      ["high", L.high, t.high24h, price],
      ["low", L.low, t.low24h, price],
      ["volume", `${L.volume} (${market.baseAsset})`, t.volume24h, (v) => formatCompact(v, locale)],
      ["quoteVolume", `${L.quoteVolume} (${market.quoteAsset})`, t.quoteVolume24h, (v) => formatCompact(v, locale)],
      ["openInterest", `${L.openInterest} (${market.baseAsset})`, t.openInterest, (v) => formatCompact(v, locale)],
    ];
    return all
      .filter(([, , value]) => value !== undefined)
      .map(([key, label, value, format]): Field => ({ key, label, value: format(value as string) }));
  });
</script>

<section class="cy-tb {className}" aria-label={market.symbol ? `${market.symbol} ${L.title}` : L.title}>
  <dl class="cy-tb__list">
    <div class="cy-tb__item cy-tb__item--last">
      <dt>{L.last}</dt>
      <dd class="cy-tb__value cy-tb__value--{direction}">
        {#if direction !== "flat"}
          <span class="cy-tb__glyph" role="img" aria-label={directionLabel}>{GLYPH[direction]}</span>
        {/if}
        {price(t.last)}
      </dd>
    </div>

    {#if t.change24h !== undefined || t.changePct24h !== undefined}
      <div class="cy-tb__item">
        <dt>{L.change}</dt>
        <dd class="cy-tb__value cy-tb__value--{direction}">{change()}</dd>
      </div>
    {/if}

    {#each fields as field (field.key)}
      <div class="cy-tb__item">
        <dt>{field.label}</dt>
        <dd class="cy-tb__value">{field.value}</dd>
      </div>
    {/each}

    {#if t.fundingRate !== undefined || t.nextFundingTime !== undefined}
      <div class="cy-tb__item">
        <dt>{L.funding}</dt>
        <dd class="cy-tb__value">
          {#if t.fundingRate !== undefined}
            <span class="cy-tb__funding cy-tb__value--{directionOf(t.fundingRate)}">
              {formatFundingRate(t.fundingRate, locale)}
            </span>
          {/if}
          {#if t.nextFundingTime !== undefined}
            <span class="cy-tb__countdown">
              <span class="cy-tb__sr">{L.countdown}</span>
              <time datetime={new Date(t.nextFundingTime).toISOString()}>
                {formatCountdown(t.nextFundingTime - now)}
              </time>
            </span>
          {/if}
        </dd>
      </div>
    {/if}
  </dl>
</section>

<style>
  .cy-tb {
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-variant-numeric: tabular-nums;
    overflow-x: auto;
  }

  .cy-tb__list {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--space-2) var(--space-5);
    margin: 0;
  }

  .cy-tb__item {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: max-content;
  }

  .cy-tb__item dt {
    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }

  .cy-tb__value {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  .cy-tb__item--last .cy-tb__value {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
  }

  .cy-tb__value--up {
    color: var(--color-trade-long-text);
  }

  .cy-tb__value--down {
    color: var(--color-trade-short-text);
  }

  .cy-tb__glyph {
    font-size: 0.75em;
  }

  .cy-tb__countdown {
    margin-inline-start: var(--space-2);
    color: var(--color-text-secondary);
  }

  .cy-tb__sr {
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
