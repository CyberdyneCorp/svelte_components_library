<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MetricCard from "./MetricCard.svelte";

  const { Story } = defineMeta({
    title: "Crypto/MetricCard",
    component: MetricCard,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ label: "Total Value Locked", value: "$1.2M" }} />

<Story name="WithChange" args={{
  label: "Total Value Locked",
  value: "$1.2M",
  change: 12.5,
  changeLabel: "vs last week",
  variant: "brand",
}} />

<Story name="AllVariants">
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; max-width: 560px;">
    <MetricCard label="TVL" value="$1.2M" change={12.5} changeLabel="vs 7d" variant="default" />
    <MetricCard label="Revenue" value="$84.2K" change={8.3} changeLabel="vs 7d" variant="brand" />
    <MetricCard label="Users" value="12,450" change={-2.1} changeLabel="vs 7d" variant="info" />
    <MetricCard label="Gas Spent" value="$340" change={15.7} changeLabel="vs 7d" variant="warning" />
  </div>
</Story>

<Story name="Compact (stat bar)">
  <div style="display: flex; gap: 1.5rem; padding: 0.5rem 1rem; background: var(--color-bg-secondary); border-radius: 8px;">
    <MetricCard size="compact" label="Aircraft" value="1,204" secondary="23s ago" />
    <MetricCard size="compact" label="Sun" value="18.9° · 58°" secondary="solar @cam 08:02" />
    <MetricCard size="compact" label="Surface" value="0 m" secondary="World Terrain" />
  </div>
</Story>

<Story name="WithSecondary">
  <MetricCard label="Camera" value="-23.02°, -43.49°" secondary="0 km altitude" variant="brand" />
</Story>
