<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PieChart from "./PieChart.svelte";

  const { Story } = defineMeta({
    title: "Charts/PieChart",
    component: PieChart,
    tags: ["autodocs"],
  });

  const defaultData = [
    { label: "ETH", value: 40 },
    { label: "BTC", value: 25 },
    { label: "SOL", value: 15 },
    { label: "USDC", value: 12 },
    { label: "Other", value: 8 },
  ];

  const smallData = [
    { label: "Active", value: 72 },
    { label: "Idle", value: 28 },
  ];
</script>

<Story name="Default" args={{ data: defaultData }} />

<Story name="Donut" args={{ data: defaultData, donut: true }} />

<Story name="Small" args={{ data: smallData, size: 120, donut: true, donutWidth: 24 }} />
