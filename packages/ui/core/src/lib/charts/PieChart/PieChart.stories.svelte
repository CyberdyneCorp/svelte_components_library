<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PieChart from "./PieChart.svelte";

  const { Story } = defineMeta({
    title: "Charts/PieChart",
    component: PieChart,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for this chart.
      a11y: { test: "error" },
    },
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

<Story
  name="Accessible"
  args={{
    data: defaultData,
    donut: true,
    title: "Portfolio allocation",
    description: "ETH is the largest holding at 40%.",
  }}
/>

<Story
  name="Localized"
  args={{
    data: defaultData,
    donut: true,
    labels: {
      chart: "Gráfico de pizza",
      columns: { label: "Categoria", value: "Valor", share: "Parcela" },
      tableCaption: "Dados por categoria",
      showData: "Mostrar dados",
      hideData: "Ocultar dados",
      legend: "Legenda",
    },
  }}
/>
