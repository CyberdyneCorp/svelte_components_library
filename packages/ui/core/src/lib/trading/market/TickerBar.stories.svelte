<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TickerBar from "./TickerBar.svelte";
  import MarketFeed from "../../_testdata/MarketFeed.svelte";
  import { createMarketFeed, demoMarket } from "../../_testdata/marketFeed.js";

  const { Story } = defineMeta({
    title: "Trading/TickerBar",
    component: TickerBar,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for trading widgets.
      a11y: { test: "error" },
    },
  });

  const ticker = { ...createMarketFeed().current().ticker, nextFundingTime: Date.now() + 90 * 60_000 };
  const falling = { ...ticker, last: "61980.5", change24h: "-1019.5", changePct24h: "-1.6183", fundingRate: "-0.00005" };
</script>

<Story name="Default" args={{ ticker, market: demoMarket, locale: "en-US" }} />

<Story name="Falling" args={{ ticker: falling, market: demoMarket, locale: "en-US" }} />

<Story
  name="Minimal"
  args={{ ticker: { market: "BTC-PERP", last: "64123.5", mark: "64124.0" }, market: demoMarket, locale: "en-US" }}
/>

<Story
  name="Localized"
  args={{
    ticker,
    market: demoMarket,
    locale: "pt-BR",
    labels: {
      title: "Resumo do mercado",
      last: "Último preço",
      mark: "Marcação",
      index: "Índice",
      change: "Variação 24h",
      high: "Máxima 24h",
      low: "Mínima 24h",
      volume: "Volume 24h",
      quoteVolume: "Giro 24h",
      openInterest: "Contratos em aberto",
      funding: "Financiamento",
      countdown: "Próximo financiamento em",
      up: "Alta",
      down: "Baixa",
    },
  }}
/>

<Story name="LiveFeed">
  {#snippet template()}
    <MarketFeed interval={250} burst={10}>
      {#snippet children(snapshot)}
        <TickerBar ticker={snapshot.ticker} market={demoMarket} locale="en-US" />
      {/snippet}
    </MarketFeed>
  {/snippet}
</Story>
