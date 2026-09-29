<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import RecentTrades from "./RecentTrades.svelte";
  import MarketFeed from "../../_testdata/MarketFeed.svelte";
  import { createMarketFeed, demoMarket } from "../../_testdata/marketFeed.js";

  const { Story } = defineMeta({
    title: "Trading/RecentTrades",
    component: RecentTrades,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for trading widgets.
      a11y: { test: "error" },
    },
  });

  const feed = createMarketFeed();
  for (let i = 0; i < 400; i++) feed.next();
  const { trades } = feed.current();
</script>

<Story name="Default" args={{ trades, market: demoMarket, locale: "en-US", timeZone: "UTC" }} />

<Story name="Compact" args={{ trades: trades.slice(0, 12), market: demoMarket, height: 200, rowHeight: 20, timeZone: "UTC" }} />

<Story name="Empty" args={{ market: demoMarket }} />

<Story
  name="Localized"
  args={{
    trades,
    market: demoMarket,
    locale: "pt-BR",
    timeZone: "America/Sao_Paulo",
    labels: { title: "Negócios recentes", price: "Preço", size: "Qtd.", time: "Hora", buy: "Compra", sell: "Venda" },
  }}
/>

<Story name="LiveFeed">
  {#snippet template()}
    <MarketFeed interval={300} burst={5}>
      {#snippet children(snapshot)}
        <div style="max-width: 420px;">
          <RecentTrades trades={snapshot.trades} market={demoMarket} locale="en-US" />
        </div>
      {/snippet}
    </MarketFeed>
  {/snippet}
</Story>
