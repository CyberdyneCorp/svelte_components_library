<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GasEstimate from "./GasEstimate.svelte";

  const { Story } = defineMeta({
    title: "Crypto/GasEstimate",
    component: GasEstimate,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  slow: { gwei: "12", time: "~10 min", usd: "$0.42" },
  standard: { gwei: "25", time: "~3 min", usd: "$0.87" },
  fast: { gwei: "45", time: "~30 sec", usd: "$1.56" },
}} />

<Story name="FastSelected" args={{
  slow: { gwei: "8", time: "~15 min", usd: "$0.28" },
  standard: { gwei: "18", time: "~5 min", usd: "$0.63" },
  fast: { gwei: "35", time: "~15 sec", usd: "$1.22" },
  selected: "fast",
}} />
