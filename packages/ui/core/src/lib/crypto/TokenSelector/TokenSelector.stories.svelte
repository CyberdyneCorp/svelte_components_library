<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TokenSelector from "./TokenSelector.svelte";

  const commonTokens = [
    { symbol: "ETH", name: "Ethereum", balance: "5.2300" },
    { symbol: "BTC", name: "Bitcoin", balance: "0.0534" },
    { symbol: "USDC", name: "USD Coin", balance: "10,240.00" },
    { symbol: "SOL", name: "Solana", balance: "142.50" },
    { symbol: "LINK", name: "Chainlink", balance: "350.00" },
    { symbol: "UNI", name: "Uniswap", balance: "89.00" },
    { symbol: "AAVE", name: "Aave", balance: "12.75" },
    { symbol: "MATIC", name: "Polygon", balance: "5,432.10" },
    { symbol: "DOT", name: "Polkadot", balance: "210.00" },
    { symbol: "AVAX", name: "Avalanche", balance: "67.30" },
  ];

  const { Story } = defineMeta({
    title: "Crypto/TokenSelector",
    component: TokenSelector,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  tokens: commonTokens,
  open: true,
}} />

<Story name="WithSearch" args={{
  tokens: commonTokens,
  open: true,
  search: "us",
}} />
