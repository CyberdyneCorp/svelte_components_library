<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BarChart from "./BarChart.svelte";

  const { Story } = defineMeta({
    title: "Charts/BarChart",
    component: BarChart,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for this chart.
      a11y: { test: "error" },
    },
  });

  const defaultData = [
    { label: "Attention", value: 0.92 },
    { label: "Embeddings", value: 0.85 },
    { label: "FFN Layers", value: 0.78 },
    { label: "Norm", value: 0.65 },
    { label: "Positional", value: 0.52 },
    { label: "Dropout", value: 0.31 },
  ];

  const horizontalData = [
    { label: "GPT-4", value: 92.1 },
    { label: "Claude 3", value: 89.7 },
    { label: "Gemini", value: 87.3 },
    { label: "Llama 3", value: 82.5 },
    { label: "Mistral", value: 79.8 },
  ];

  const coloredData = [
    { label: "Train", value: 0.95, color: "#00ff41" },
    { label: "Valid", value: 0.88, color: "#00d4ff" },
    { label: "Test", value: 0.85, color: "#bf5af2" },
    { label: "OOD", value: 0.62, color: "#ffb800" },
  ];

  const spendSeries = [
    { name: "Compute", data: [{ label: "Jan", value: 420 }, { label: "Feb", value: 510 }, { label: "Mar", value: 480 }, { label: "Apr", value: 620 }] },
    { name: "Storage", data: [{ label: "Jan", value: 180 }, { label: "Feb", value: 190 }, { label: "Mar", value: 230 }, { label: "Apr", value: 240 }] },
    { name: "Network", data: [{ label: "Jan", value: 90 }, { label: "Feb", value: 120 }, { label: "Mar", value: 110 }, { label: "Apr", value: 160 }] },
  ];

  const regionSeries = [
    { name: "Healthy", data: [{ label: "us-east", value: 42 }, { label: "eu-west", value: 35 }, { label: "ap-south", value: 18 }] },
    { name: "Degraded", data: [{ label: "us-east", value: 3 }, { label: "eu-west", value: 6 }, { label: "ap-south", value: 4 }] },
    { name: "Down", data: [{ label: "us-east", value: 1 }, { label: "ap-south", value: 2 }] },
  ];
</script>

<Story name="Default" args={{ data: defaultData }} />

<Story name="Horizontal" args={{ horizontal: true, data: horizontalData, barColor: "#00d4ff" }} />

<Story name="Colored" args={{ data: coloredData }} />

<Story
  name="Accessible"
  args={{
    data: coloredData,
    title: "Accuracy by split",
    description: "Out-of-distribution accuracy trails the other splits by over 20 points.",
  }}
/>

<!-- One bar per series inside each category; a legend and in-bar shapes tell series apart without colour. -->
<Story name="Grouped" args={{ series: spendSeries, title: "Cloud spend by month", showValues: false }} />

<!-- Segments stack in series order; the value label is the category total. -->
<Story name="Stacked" args={{ series: spendSeries, stacked: true, title: "Cloud spend by month" }} />

<!-- A missing category ("Down" in eu-west) counts as 0. -->
<Story name="Stacked horizontal" args={{ series: regionSeries, stacked: true, horizontal: true, title: "Instances by region" }} />
