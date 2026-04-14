<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StatCard from "./StatCard.svelte";
  const { Story } = defineMeta({ title: "Retro/StatCard", component: StatCard, tags: ["autodocs"] });
</script>

<Story name="Treasury" args={{
  icon: "💰",
  title: "Treasury",
  primary: "$3,840,977.80",
  rows: [
    { label: "ETH", value: "1,247.83" },
    { label: "USDC", value: "425,780" },
    { label: "BTC", value: "12.45" },
  ],
}} />

<Story name="Operations" args={{
  icon: "📊",
  title: "Operations",
  rows: [
    { label: "Income", value: "$2,847,362.45" },
    { label: "Costs", value: "$1,923,847.32" },
    { label: "Profit", value: "$923,515.13", accent: "info" },
    { label: "Margin", value: "32.4%" },
  ],
}} />
