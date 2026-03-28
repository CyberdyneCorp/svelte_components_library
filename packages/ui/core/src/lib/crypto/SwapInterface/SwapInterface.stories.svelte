<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SwapInterface from "./SwapInterface.svelte";

  const { Story } = defineMeta({
    title: "Crypto/SwapInterface",
    component: SwapInterface,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  fromToken: { symbol: "ETH", balance: "5.23" },
  toToken: { symbol: "USDC", balance: "10,240" },
}} />

<Story name="WithRate" args={{
  fromToken: { symbol: "ETH", balance: "5.23" },
  toToken: { symbol: "USDC", balance: "10,240" },
  fromAmount: "1.5",
  toAmount: "2,847.50",
  exchangeRate: "1 ETH = 1,898.33 USDC",
  priceImpact: "0.03%",
  slippage: 0.5,
}} />

<Story name="Loading" args={{
  fromToken: { symbol: "ETH", balance: "5.23" },
  toToken: { symbol: "USDC", balance: "10,240" },
  fromAmount: "2.0",
  toAmount: "3,796.66",
  exchangeRate: "1 ETH = 1,898.33 USDC",
  priceImpact: "0.05%",
  loading: true,
}} />
