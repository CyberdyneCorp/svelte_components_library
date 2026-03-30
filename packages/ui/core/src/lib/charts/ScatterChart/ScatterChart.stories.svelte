<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ScatterChart from "./ScatterChart.svelte";

  const { Story } = defineMeta({
    title: "Charts/ScatterChart",
    component: ScatterChart,
    tags: ["autodocs"],
  });

  const modelComparison = [
    {
      name: "GPT-4",
      data: [
        { x: 1.2, y: 89.3 }, { x: 2.1, y: 91.7 }, { x: 3.5, y: 93.2 },
        { x: 5.0, y: 94.1 }, { x: 7.8, y: 94.8 }, { x: 10.2, y: 95.1 },
      ],
    },
    {
      name: "Claude",
      data: [
        { x: 0.8, y: 87.5 }, { x: 1.5, y: 90.2 }, { x: 2.8, y: 92.8 },
        { x: 4.2, y: 94.5 }, { x: 6.1, y: 95.3 }, { x: 8.5, y: 96.0 },
      ],
    },
    {
      name: "Llama",
      data: [
        { x: 0.5, y: 78.2 }, { x: 1.0, y: 82.1 }, { x: 2.0, y: 85.5 },
        { x: 3.5, y: 88.3 }, { x: 5.5, y: 90.1 }, { x: 8.0, y: 91.2 },
      ],
    },
  ];

  const singleSeries = [
    {
      name: "Token Pairs",
      data: [
        { x: 12.5, y: 340, label: "ETH/USDC" },
        { x: 8.2, y: 520, label: "BTC/USDT" },
        { x: 45.1, y: 180, label: "SOL/USDC" },
        { x: 22.3, y: 290, label: "AVAX/USDT" },
        { x: 3.1, y: 780, label: "MATIC/USDC" },
        { x: 67.8, y: 95, label: "DOT/USDT" },
        { x: 15.4, y: 410, label: "LINK/ETH" },
        { x: 31.2, y: 220, label: "UNI/USDC" },
      ],
    },
  ];

  const clusters = [
    {
      name: "High Performance",
      color: "#00ff41",
      data: Array.from({ length: 20 }, () => ({
        x: 70 + Math.random() * 25,
        y: 80 + Math.random() * 18,
      })),
    },
    {
      name: "Medium Performance",
      color: "#00d4ff",
      data: Array.from({ length: 25 }, () => ({
        x: 30 + Math.random() * 30,
        y: 40 + Math.random() * 30,
      })),
    },
    {
      name: "Low Performance",
      color: "#ff5555",
      data: Array.from({ length: 15 }, () => ({
        x: 5 + Math.random() * 20,
        y: 5 + Math.random() * 25,
      })),
    },
  ];
</script>

<Story name="Default" args={{ series: modelComparison, xLabel: "Parameters (B)", yLabel: "Accuracy (%)" }} />

<Story name="WithTrendLine" args={{ series: modelComparison, xLabel: "Parameters (B)", yLabel: "Accuracy (%)", showTrendLine: true }} />

<Story name="SingleSeries" args={{ series: singleSeries, xLabel: "Spread (%)", yLabel: "Volume ($K)", pointSize: 7 }} />

<Story name="Clusters" args={{ series: clusters, xLabel: "Feature 1", yLabel: "Feature 2", pointSize: 4, showLegend: true }} />

<Story name="NoGrid" args={{ series: modelComparison, xLabel: "Parameters", yLabel: "Score", showGrid: false }} />
