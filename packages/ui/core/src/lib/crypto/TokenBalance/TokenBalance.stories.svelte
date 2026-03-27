<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TokenBalance from "./TokenBalance.svelte";

  const { Story } = defineMeta({
    title: "Crypto/TokenBalance",
    component: TokenBalance,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <TokenBalance symbol="ETH" balance="1.2345" usdValue="$2,450.00" />
</Story>

<Story name="WithChange">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <TokenBalance symbol="ETH" balance="1.2345" usdValue="$2,450.00" change={5.23} />
    <TokenBalance symbol="BTC" balance="0.0534" usdValue="$3,120.00" change={-2.15} />
  </div>
</Story>

<Story name="MultipleTokens">
  <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px;">
    <TokenBalance symbol="ETH" balance="1.2345" usdValue="$2,450.00" change={5.23} />
    <TokenBalance symbol="BTC" balance="0.0534" usdValue="$3,120.00" change={-2.15} />
    <TokenBalance symbol="USDC" balance="10,000.00" usdValue="$10,000.00" change={0.01} />
    <TokenBalance symbol="MATIC" balance="5,432.10" usdValue="$4,320.00" />
  </div>
</Story>
