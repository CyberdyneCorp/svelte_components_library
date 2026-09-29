<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TokenPairIcon from "./TokenPairIcon.svelte";
  const { Story } = defineMeta({
    title: "Retro/TokenPairIcon",
    component: TokenPairIcon,
    tags: ["autodocs"],
    // Axe violations fail the storybook test project for this component.
    parameters: { a11y: { test: "error" } },
  });
</script>

<Story name="WETHUSDC" args={{ tokenA: "WETH", tokenB: "USDC" }} />
<Story name="Large" args={{ tokenA: "UNI", tokenB: "WETH", size: 48 }} />
<Story name="CustomColors" args={{ tokenA: "BTC", tokenB: "ETH", size: 40, tokenAColor: "#f7931a", tokenBColor: "#627eea" }} />
<Story name="Calm" globals={{ theme: "calm" }} args={{ tokenA: "WETH", tokenB: "USDC", size: 40 }} />
<Story name="CalmDark" globals={{ theme: "calm-dark" }} args={{ tokenA: "WETH", tokenB: "USDC", size: 40 }} />
<Story
  name="ThreeInitials"
  globals={{ theme: "calm" }}
  args={{ tokenA: "WBTC", tokenB: "USDC", size: 48, maxInitials: 3 }}
/>
<Story name="NoInitials" args={{ tokenA: "WETH", tokenB: "USDC", showInitials: false }} />
