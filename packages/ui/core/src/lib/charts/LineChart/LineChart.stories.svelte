<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LineChart from "./LineChart.svelte";

  const { Story } = defineMeta({
    title: "Charts/LineChart",
    component: LineChart,
    tags: ["autodocs"],
  });
</script>

<Story name="SingleSeries">
  <div style="width: 600px; height: 350px;">
    <LineChart
      series={[
        {
          name: "Training Loss",
          data: [
            { x: 1, y: 2.5 },
            { x: 2, y: 1.8 },
            { x: 3, y: 1.2 },
            { x: 4, y: 0.9 },
            { x: 5, y: 0.7 },
            { x: 6, y: 0.55 },
            { x: 7, y: 0.45 },
            { x: 8, y: 0.38 },
            { x: 9, y: 0.32 },
            { x: 10, y: 0.28 },
          ],
        },
      ]}
      xLabel="Epoch"
      yLabel="Loss"
    />
  </div>
</Story>

<Story name="MultiSeries">
  <div style="width: 600px; height: 350px;">
    <LineChart
      series={[
        {
          name: "GPT-4",
          data: [
            { x: 0, y: 3.2 }, { x: 1, y: 2.1 }, { x: 2, y: 1.4 }, { x: 3, y: 0.9 },
            { x: 4, y: 0.6 }, { x: 5, y: 0.45 }, { x: 6, y: 0.35 }, { x: 7, y: 0.28 },
          ],
        },
        {
          name: "Claude",
          data: [
            { x: 0, y: 3.0 }, { x: 1, y: 1.9 }, { x: 2, y: 1.3 }, { x: 3, y: 0.85 },
            { x: 4, y: 0.55 }, { x: 5, y: 0.4 }, { x: 6, y: 0.3 }, { x: 7, y: 0.25 },
          ],
        },
        {
          name: "Gemini",
          data: [
            { x: 0, y: 3.5 }, { x: 1, y: 2.4 }, { x: 2, y: 1.7 }, { x: 3, y: 1.1 },
            { x: 4, y: 0.8 }, { x: 5, y: 0.6 }, { x: 6, y: 0.48 }, { x: 7, y: 0.4 },
          ],
        },
      ]}
      xLabel="Epoch"
      yLabel="Loss"
    />
  </div>
</Story>

<Story name="WithLabels">
  <div style="width: 600px; height: 350px;">
    <LineChart
      series={[
        {
          name: "Accuracy",
          data: [
            { x: 10, y: 0.65 }, { x: 20, y: 0.72 }, { x: 30, y: 0.78 },
            { x: 40, y: 0.82 }, { x: 50, y: 0.85 }, { x: 60, y: 0.87 },
            { x: 70, y: 0.89 }, { x: 80, y: 0.9 }, { x: 90, y: 0.91 }, { x: 100, y: 0.92 },
          ],
          color: "#00d4ff",
        },
      ]}
      xLabel="Training Samples (k)"
      yLabel="Accuracy"
    />
  </div>
</Story>
