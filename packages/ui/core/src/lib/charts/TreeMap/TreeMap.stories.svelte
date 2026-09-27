<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TreeMap from "./TreeMap.svelte";

  const { Story } = defineMeta({
    title: "Charts/TreeMap",
    component: TreeMap,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for this chart.
      a11y: { test: "error" },
    },
  });

  const portfolioData = [
    { label: "ETH", value: 45000 },
    { label: "BTC", value: 32000 },
    { label: "SOL", value: 18000 },
    { label: "AAVE", value: 8500 },
    { label: "UNI", value: 6200 },
    { label: "LINK", value: 4800 },
    { label: "MATIC", value: 3500 },
    { label: "ARB", value: 2800 },
  ];

  const simpleData = [
    { label: "Alpha", value: 40 },
    { label: "Beta", value: 30 },
    { label: "Gamma", value: 20 },
    { label: "Delta", value: 10 },
  ];
</script>

<Story name="Portfolio" args={{ data: portfolioData, height: "320px" }} />

<Story name="Simple" args={{ data: simpleData, height: "240px" }} />

<Story
  name="Accessible"
  args={{
    data: portfolioData,
    height: "320px",
    title: "Portfolio by asset",
    description: "ETH and BTC make up over 60% of holdings.",
  }}
/>
