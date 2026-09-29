<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OrderBook from "./OrderBook.svelte";
  import MarketFeed from "../../_testdata/MarketFeed.svelte";
  import { createMarketFeed, demoMarket } from "../../_testdata/marketFeed.js";

  const { Story } = defineMeta({
    title: "Trading/OrderBook",
    component: OrderBook,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for trading widgets.
      a11y: { test: "error" },
    },
  });

  const snapshot = createMarketFeed().current();
  const spec = {
    bids: [
      { price: "64000.0", size: "1" },
      { price: "63999.5", size: "2" },
      { price: "63999.0", size: "3" },
    ],
    asks: [
      { price: "64000.5", size: "0.5" },
      { price: "64001.0", size: "1.5" },
    ],
  };
</script>

<Story
  name="Default"
  args={{ bids: snapshot.bids, asks: snapshot.asks, market: demoMarket, levels: 12, locale: "en-US" }}
/>

<Story
  name="Grouped"
  args={{ bids: snapshot.bids, asks: snapshot.asks, market: demoMarket, grouping: "5.0", levels: 8, locale: "en-US" }}
/>

<Story name="SpecGrouping" args={{ ...spec, market: demoMarket, grouping: "1", locale: "en-US" }} />

<Story
  name="ClickablePrices"
  args={{
    bids: snapshot.bids,
    asks: snapshot.asks,
    market: demoMarket,
    levels: 8,
    locale: "en-US",
    onpriceclick: (price) => console.info("price", price),
  }}
/>

<Story name="BidsOnly" args={{ bids: snapshot.bids, market: demoMarket, layout: "bids", levels: 10 }} />

<Story name="AsksOnly" args={{ asks: snapshot.asks, market: demoMarket, layout: "asks", levels: 10 }} />

<Story name="Empty" args={{ market: demoMarket }} />

<Story
  name="Crossed"
  args={{
    bids: [{ price: "64010.0", size: "0.4" }],
    asks: [{ price: "64005.5", size: "0.2" }],
    market: demoMarket,
  }}
/>

<Story
  name="Localized"
  args={{
    bids: snapshot.bids,
    asks: snapshot.asks,
    market: demoMarket,
    levels: 6,
    locale: "pt-BR",
    labels: {
      title: "Livro de ofertas",
      grouping: "Agrupamento",
      price: "Preço",
      size: "Qtd.",
      total: "Total",
      bids: "Compras",
      asks: "Vendas",
      bid: "Compra",
      ask: "Venda",
      spread: "Spread",
      empty: "Sem ofertas",
    },
  }}
/>

<Story name="LiveFeed">
  {#snippet template()}
    <MarketFeed interval={200} burst={20}>
      {#snippet children(feed)}
        <div style="max-width: 420px;">
          <OrderBook
            bids={feed.bids}
            asks={feed.asks}
            market={demoMarket}
            levels={10}
            locale="en-US"
            onpriceclick={(price) => console.info("price", price)}
          />
        </div>
      {/snippet}
    </MarketFeed>
  {/snippet}
</Story>
