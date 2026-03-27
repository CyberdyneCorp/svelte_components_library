<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PriceDisplay from "./PriceDisplay.svelte";

  const { Story } = defineMeta({
    title: "Crypto/PriceDisplay",
    component: PriceDisplay,
    tags: ["autodocs"],
  });
</script>

<Story name="Positive">
  <div style="max-width: 280px;">
    <PriceDisplay symbol="ETH" price="$1,847.32" change={5.23} period="24h" />
  </div>
</Story>

<Story name="Negative">
  <div style="max-width: 280px;">
    <PriceDisplay symbol="BTC" price="$42,150.00" change={-2.87} period="24h" />
  </div>
</Story>

<Story name="Neutral">
  <div style="max-width: 280px;">
    <PriceDisplay symbol="USDC" price="$1.00" change={0} period="24h" />
  </div>
</Story>
