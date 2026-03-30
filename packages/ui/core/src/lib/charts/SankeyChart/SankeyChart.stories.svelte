<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SankeyChart from "./SankeyChart.svelte";

  const { Story } = defineMeta({
    title: "Charts/SankeyChart",
    component: SankeyChart,
    tags: ["autodocs"],
  });

  const trafficFlow = {
    nodes: [
      { id: "organic", label: "Organic Search" },
      { id: "paid", label: "Paid Ads" },
      { id: "social", label: "Social Media" },
      { id: "direct", label: "Direct" },
      { id: "landing", label: "Landing Page" },
      { id: "docs", label: "Documentation" },
      { id: "pricing", label: "Pricing" },
      { id: "signup", label: "Sign Up" },
      { id: "demo", label: "Request Demo" },
      { id: "bounce", label: "Bounce" },
    ],
    links: [
      { source: "organic", target: "landing", value: 450 },
      { source: "organic", target: "docs", value: 280 },
      { source: "paid", target: "landing", value: 320 },
      { source: "paid", target: "pricing", value: 180 },
      { source: "social", target: "landing", value: 150 },
      { source: "direct", target: "docs", value: 200 },
      { source: "direct", target: "pricing", value: 120 },
      { source: "landing", target: "signup", value: 380 },
      { source: "landing", target: "bounce", value: 540 },
      { source: "docs", target: "signup", value: 190 },
      { source: "docs", target: "bounce", value: 290 },
      { source: "pricing", target: "signup", value: 150 },
      { source: "pricing", target: "demo", value: 100 },
      { source: "pricing", target: "bounce", value: 50 },
    ],
  };

  const pipeline = {
    nodes: [
      { id: "raw", label: "Raw Data", color: "#00d4ff" },
      { id: "clean", label: "Cleaned", color: "#00d4ff" },
      { id: "train", label: "Training Set", color: "#00ff41" },
      { id: "val", label: "Validation Set", color: "#a855f7" },
      { id: "test", label: "Test Set", color: "#ffb800" },
      { id: "model", label: "Model", color: "#00ff41" },
      { id: "deploy", label: "Production", color: "#00ff41" },
      { id: "discard", label: "Discarded", color: "#ff5555" },
    ],
    links: [
      { source: "raw", target: "clean", value: 10000 },
      { source: "raw", target: "discard", value: 2500 },
      { source: "clean", target: "train", value: 6000 },
      { source: "clean", target: "val", value: 2000 },
      { source: "clean", target: "test", value: 2000 },
      { source: "train", target: "model", value: 6000 },
      { source: "val", target: "model", value: 2000 },
      { source: "model", target: "deploy", value: 8000 },
    ],
  };

  const tokenFlow = {
    nodes: [
      { id: "eth", label: "Ethereum" },
      { id: "bsc", label: "BSC" },
      { id: "polygon", label: "Polygon" },
      { id: "uniswap", label: "Uniswap" },
      { id: "aave", label: "Aave" },
      { id: "curve", label: "Curve" },
      { id: "staking", label: "Staking" },
      { id: "lending", label: "Lending" },
      { id: "lp", label: "LP Pools" },
    ],
    links: [
      { source: "eth", target: "uniswap", value: 850 },
      { source: "eth", target: "aave", value: 620 },
      { source: "eth", target: "curve", value: 430 },
      { source: "bsc", target: "uniswap", value: 310 },
      { source: "polygon", target: "aave", value: 280 },
      { source: "polygon", target: "curve", value: 190 },
      { source: "uniswap", target: "lp", value: 1160 },
      { source: "aave", target: "lending", value: 900 },
      { source: "curve", target: "lp", value: 620 },
      { source: "curve", target: "staking", value: 200 },
    ],
  };
</script>

<Story name="Default" args={{ ...trafficFlow }} />

<Story name="MLPipeline" args={{ ...pipeline }} />

<Story name="TokenFlow" args={{ ...tokenFlow }} />

<Story name="NoValues" args={{ ...trafficFlow, showValues: false }} />
