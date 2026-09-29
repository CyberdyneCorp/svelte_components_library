<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { BTC_USDT } from "../../_testdata/trading.js";
  import { divideDecimal, multiplyDecimal, subtractDecimal } from "../decimal.js";
  import OrderTicket from "./OrderTicket.svelte";

  const { Story } = defineMeta({
    title: "Trading/OrderTicket",
    component: OrderTicket,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for this component.
      a11y: { test: "error" },
    },
  });

  /**
   * Demo-only isolated-margin estimate for a long: entry × (1 − 1/leverage).
   * Real liquidation maths is exchange-specific and belongs to the consumer.
   */
  function demoLiquidation(draft) {
    if (!draft.price || draft.side !== "long") return undefined;
    const factor = subtractDecimal("1", divideDecimal("1", String(draft.leverage), 8));
    return multiplyDecimal(draft.price, factor);
  }
</script>

<Story
  name="Limit"
  args={{
    market: BTC_USDT,
    locale: "en-US",
    available: "2500",
    price: "64000.0",
    leverage: 10,
    makerFee: "0.0002",
    takerFee: "0.0005",
  }}
/>

<Story
  name="MarketWithReferencePrice"
  args={{
    market: BTC_USDT,
    locale: "en-US",
    type: "market",
    side: "short",
    available: "2500",
    referencePrice: "64120.5",
    leverage: 20,
    takerFee: "0.0005",
  }}
/>

<Story
  name="WithLiquidationEstimate"
  args={{
    market: BTC_USDT,
    locale: "en-US",
    available: "2500",
    price: "64000.0",
    leverage: 10,
    takerFee: "0.0005",
    estimateLiquidation: demoLiquidation,
  }}
/>

<Story
  name="Localized"
  args={{
    market: BTC_USDT,
    locale: "pt-BR",
    available: "2500",
    price: "64000.0",
    labels: {
      form: "Boleta",
      side: "Lado",
      sides: { long: "Compra", short: "Venda" },
      price: "Preço",
      size: "Tamanho",
      available: "Disponível",
      submit: (side) => (side === "long" ? "Comprar" : "Vender"),
      leverage: { label: "Alavancagem", input: "Valor da alavancagem" },
    },
  }}
/>

<Story name="Disabled" args={{ market: BTC_USDT, locale: "en-US", disabled: true }} />
