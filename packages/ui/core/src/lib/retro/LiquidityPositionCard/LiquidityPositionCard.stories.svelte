<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LiquidityPositionCard from "./LiquidityPositionCard.svelte";
  const { Story } = defineMeta({ title: "Retro/LiquidityPositionCard", component: LiquidityPositionCard, tags: ["autodocs"] });
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
