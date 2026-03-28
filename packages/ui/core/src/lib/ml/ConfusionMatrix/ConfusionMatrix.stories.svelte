<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ConfusionMatrix from "./ConfusionMatrix.svelte";

  const { Story } = defineMeta({
    title: "ML/ConfusionMatrix",
    component: ConfusionMatrix,
    tags: ["autodocs"],
  });

  const binaryMatrix = [
    [842, 18],
    [12, 628],
  ];
  const binaryLabels = ["Not Spam", "Spam"];

  const multiClassMatrix = [
    [156, 3, 1, 0],
    [5, 203, 8, 2],
    [2, 7, 189, 4],
    [0, 1, 3, 167],
  ];
  const multiClassLabels = ["Wire", "ACH", "Card", "Crypto"];

  const percentMatrix = [
    [92, 5, 3],
    [4, 88, 8],
    [2, 6, 92],
  ];
  const percentLabels = ["Positive", "Neutral", "Negative"];
</script>

<Story name="Binary" args={{
  matrix: binaryMatrix,
  labels: binaryLabels,
  title: "Spam Detection - Confusion Matrix",
  showValues: true,
  colorScale: "green",
}} />

<Story name="MultiClass" args={{
  matrix: multiClassMatrix,
  labels: multiClassLabels,
  title: "Transaction Type Classification",
  showValues: true,
  colorScale: "cyan",
}} />

<Story name="WithPercentages" args={{
  matrix: percentMatrix,
  labels: percentLabels,
  title: "Sentiment Analysis (Percentages)",
  showValues: true,
  showPercentages: true,
  colorScale: "green",
}} />
