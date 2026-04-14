<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PriceChart from "./PriceChart.svelte";
  const { Story } = defineMeta({ title: "Retro/PriceChart", component: PriceChart, tags: ["autodocs"] });

  const candles = Array.from({ length: 30 }, (_, i) => {
    const open = 100 + Math.sin(i / 3) * 20 + i * 0.8;
    const close = open + (Math.random() - 0.5) * 12;
    const high = Math.max(open, close) + Math.random() * 8;
    const low = Math.min(open, close) - Math.random() * 8;
    return { t: i, open, high, low, close };
  });
</script>

<Story name="Default" args={{ candles }} />
<Story name="Empty" args={{ candles: [] }} />
