<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MetricCard from "./MetricCard.svelte";

  const { Story } = defineMeta({
    title: "Crypto/MetricCard",
    component: MetricCard,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="max-width: 260px;">
    <MetricCard label="Total Value Locked" value="$1.2M" />
  </div>
</Story>

<Story name="WithChange">
  <div style="max-width: 260px;">
    <MetricCard
      label="Total Value Locked"
      value="$1.2M"
      change={12.5}
      changeLabel="vs last week"
      variant="brand"
    />
  </div>
</Story>

<Story name="AllVariants">
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; max-width: 560px;">
    <MetricCard label="TVL" value="$1.2M" change={12.5} changeLabel="vs 7d" variant="default" />
    <MetricCard label="Revenue" value="$84.2K" change={8.3} changeLabel="vs 7d" variant="brand" />
    <MetricCard label="Users" value="12,450" change={-2.1} changeLabel="vs 7d" variant="info" />
    <MetricCard label="Gas Spent" value="$340" change={15.7} changeLabel="vs 7d" variant="warning" />
  </div>
</Story>
