<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PoolRangeHistogram from "./PoolRangeHistogram.svelte";
  const { Story } = defineMeta({ title: "Retro/PoolRangeHistogram", component: PoolRangeHistogram, tags: ["autodocs"] });

  const buckets = Array.from({ length: 40 }, (_, i) => {
    const price = 3200 + i * 20;
    const dist = Math.abs(i - 20);
    const liquidity = Math.max(0, 60 - dist * dist * 0.1) + Math.random() * 10;
    return { price, liquidity };
  });
</script>

<Story name="Default" args={{ buckets, currentPrice: 3600, selectedLower: 3400, selectedUpper: 3800 }} />
<Story name="NoSelection" args={{ buckets, currentPrice: 3600 }} />
<Story name="Empty" args={{ buckets: [] }} />
