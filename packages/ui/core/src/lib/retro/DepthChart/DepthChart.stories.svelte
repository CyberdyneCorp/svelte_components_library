<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DepthChart from "./DepthChart.svelte";
  const { Story } = defineMeta({ title: "Retro/DepthChart", component: DepthChart, tags: ["autodocs"] });

  const bids = Array.from({ length: 15 }, (_, i) => ({ price: 100 - i * 0.5, size: 10 + Math.random() * 40 }));
  const asks = Array.from({ length: 15 }, (_, i) => ({ price: 100.5 + i * 0.5, size: 10 + Math.random() * 40 }));
</script>

<Story name="Default" args={{ bids, asks, currentPrice: 100.25 }} />
<Story name="Empty" args={{ bids: [], asks: [] }} />
