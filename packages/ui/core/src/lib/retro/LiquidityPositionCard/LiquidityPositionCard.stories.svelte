<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LiquidityPositionCard from "./LiquidityPositionCard.svelte";
  const { Story } = defineMeta({
    title: "Retro/LiquidityPositionCard",
    component: LiquidityPositionCard,
    tags: ["autodocs"],
    // Axe violations fail the storybook test project for this component.
    parameters: { a11y: { test: "error" } },
  });

  /** Decimal-safe Uniswap v3 position: strings end to end, fees owed in both tokens. */
  const decimalPosition = {
    tokenA: "WETH",
    tokenB: "USDC",
    feeTier: "0.05%",
    tokenId: "812345",
    chain: "Ethereum",
    walletLabel: "Cold wallet",
    locale: "en-US",
    valueMoney: { amount: "12600.42", currency: "USD" },
    pnlMoney: { amount: "-316.96", currency: "USD" },
    uncollectedFees: [
      { asset: "WETH", amount: "0.001234567890123456", decimals: 18 },
      { asset: "USDC", amount: "3.214512", decimals: 6 },
    ],
    uncollectedTotal: { amount: "7.91", currency: "USD" },
    feeApyPct: 68.43,
    range: { min: 3100, max: 4100, lower: 3200, upper: 3900, current: 3450 },
    precision: 0,
    rangeText: "In range: 3,200 to 3,900 USDC per WETH, current price 3,450.",
  };
</script>

<Story name="OutOfRange" args={{
  tokenA: "WETH", tokenB: "USDC", value: 12600, pnl: -316.96,
  range: { min: 3100, max: 4100, lower: 3200, upper: 3900, current: 4500 },
  feeApyPct: 68.43, uncollected: 7.91,
  precision: 0,
}} />

<Story name="InRange" args={{
  tokenA: "UNI", tokenB: "WETH", value: 8500, pnl: 125.43,
  range: { min: 0.0032, max: 0.0045, lower: 0.0035, upper: 0.0042, current: 0.0039 },
  feeApyPct: 24.8, uncollected: 15.23,
}} />

<Story name="DecimalCalm" globals={{ theme: "calm" }} args={decimalPosition} />

<Story name="DecimalCalmDark" globals={{ theme: "calm-dark" }} args={decimalPosition} />

<Story
  name="DecimalCalmPtBR"
  globals={{ theme: "calm" }}
  args={{
    ...decimalPosition,
    locale: "pt-BR",
    valueMoney: { amount: "63002.10", currency: "BRL" },
    pnlMoney: { amount: "1580.33", currency: "BRL" },
    uncollectedTotal: { amount: "39.55", currency: "BRL" },
  }}
/>

<Story
  name="MinimalRows"
  globals={{ theme: "calm" }}
  args={{
    tokenA: "WBTC",
    tokenB: "WETH",
    chain: "Arbitrum",
    locale: "en-US",
    valueMoney: { amount: "0.000000000000000001", currency: "ETH", decimals: 18 },
    range: { min: 10, max: 30, lower: 15, upper: 25, current: 12 },
    precision: 1,
    rangeText: "Out of range: 15 to 25 WETH per WBTC, current price 12.",
  }}
/>
