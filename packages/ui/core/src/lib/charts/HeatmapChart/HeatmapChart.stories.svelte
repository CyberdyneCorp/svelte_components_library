<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import HeatmapChart from "./HeatmapChart.svelte";

  const { Story } = defineMeta({
    title: "Charts/HeatmapChart",
    component: HeatmapChart,
    tags: ["autodocs"],
  });

  const correlationLabels = ["Feature A", "Feature B", "Feature C", "Feature D", "Feature E"];
  const correlationData = [
    [ 1.00,  0.85, -0.32,  0.12,  0.67],
    [ 0.85,  1.00, -0.45,  0.08,  0.72],
    [-0.32, -0.45,  1.00,  0.55, -0.28],
    [ 0.12,  0.08,  0.55,  1.00,  0.15],
    [ 0.67,  0.72, -0.28,  0.15,  1.00],
  ];

  const attentionLabels = ["Token 1", "Token 2", "Token 3", "Token 4", "Token 5", "Token 6", "Token 7", "Token 8"];
  const attentionData = [
    [0.85, 0.12, 0.02, 0.01, 0.00, 0.00, 0.00, 0.00],
    [0.15, 0.72, 0.10, 0.02, 0.01, 0.00, 0.00, 0.00],
    [0.05, 0.08, 0.68, 0.15, 0.03, 0.01, 0.00, 0.00],
    [0.02, 0.03, 0.12, 0.65, 0.14, 0.03, 0.01, 0.00],
    [0.01, 0.01, 0.04, 0.10, 0.62, 0.18, 0.03, 0.01],
    [0.00, 0.01, 0.02, 0.05, 0.15, 0.58, 0.16, 0.03],
    [0.00, 0.00, 0.01, 0.02, 0.05, 0.12, 0.60, 0.20],
    [0.00, 0.00, 0.00, 0.01, 0.02, 0.05, 0.18, 0.74],
  ];

  const confusionLabels = ["Cat", "Dog", "Bird"];
  const confusionData = [
    [42, 5, 3],
    [8, 38, 4],
    [2, 6, 44],
  ];
</script>

<Story name="CorrelationMatrix" args={{
  title: "Feature Correlation Matrix",
  colorScale: "diverging",
  xLabels: correlationLabels,
  yLabels: correlationLabels,
  data: correlationData,
}} />

<Story name="Attention" args={{
  title: "Attention Weights",
  colorScale: "green",
  xLabels: attentionLabels,
  yLabels: attentionLabels,
  data: attentionData,
}} />

<Story name="Small" args={{
  title: "Confusion Matrix",
  colorScale: "cyan",
  xLabels: confusionLabels,
  yLabels: confusionLabels,
  data: confusionData,
}} />
