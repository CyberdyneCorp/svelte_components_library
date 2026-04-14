<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TokenPairIcon from "./TokenPairIcon.svelte";
  const { Story } = defineMeta({ title: "Retro/TokenPairIcon", component: TokenPairIcon, tags: ["autodocs"] });
</script>

<Story name="WETHUSDC" args={{ tokenA: "WETH", tokenB: "USDC" }} />
<Story name="Large" args={{ tokenA: "UNI", tokenB: "WETH", size: 48 }} />
<Story name="CustomColors" args={{ tokenA: "BTC", tokenB: "ETH", size: 40, tokenAColor: "#f7931a", tokenBColor: "#627eea" }} />
