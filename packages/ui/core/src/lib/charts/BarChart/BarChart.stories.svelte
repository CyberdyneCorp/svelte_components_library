<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BarChart from "./BarChart.svelte";

  const { Story } = defineMeta({
    title: "Charts/BarChart",
    component: BarChart,
    tags: ["autodocs"],
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
</script>

<Story name="Default" args={{ data: defaultData }} />

<Story name="Horizontal" args={{ horizontal: true, data: horizontalData, barColor: "#00d4ff" }} />

<Story name="Colored" args={{ data: coloredData }} />
