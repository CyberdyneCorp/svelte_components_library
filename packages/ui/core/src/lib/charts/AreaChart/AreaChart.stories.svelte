<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AreaChart from "./AreaChart.svelte";

  const { Story } = defineMeta({
    title: "Charts/AreaChart",
    component: AreaChart,
    tags: ["autodocs"],
  });

  const singleSeries = [
    {
      name: "Portfolio Value",
      data: [
        { x: 1, y: 10000 }, { x: 2, y: 10500 }, { x: 3, y: 11200 },
        { x: 4, y: 10800 }, { x: 5, y: 11800 }, { x: 6, y: 12500 },
        { x: 7, y: 13200 }, { x: 8, y: 12900 }, { x: 9, y: 14100 },
        { x: 10, y: 15000 }, { x: 11, y: 15800 }, { x: 12, y: 16500 },
      ],
    },
  ];

  const stackedSeries = [
    {
      name: "Equities",
      data: [
        { x: 1, y: 5000 }, { x: 2, y: 5200 }, { x: 3, y: 5500 },
        { x: 4, y: 5300 }, { x: 5, y: 5800 }, { x: 6, y: 6100 },
      ],
    },
    {
      name: "Bonds",
      data: [
        { x: 1, y: 3000 }, { x: 2, y: 3100 }, { x: 3, y: 3050 },
        { x: 4, y: 3200 }, { x: 5, y: 3300 }, { x: 6, y: 3250 },
      ],
    },
    {
      name: "Crypto",
      data: [
        { x: 1, y: 2000 }, { x: 2, y: 2400 }, { x: 3, y: 1800 },
        { x: 4, y: 2600 }, { x: 5, y: 3000 }, { x: 6, y: 3500 },
      ],
    },
  ];

  const multiSeries = [
    {
      name: "Model A",
      data: [
        { x: 0, y: 20 }, { x: 1, y: 35 }, { x: 2, y: 45 },
        { x: 3, y: 52 }, { x: 4, y: 58 }, { x: 5, y: 62 },
      ],
    },
    {
      name: "Model B",
      data: [
        { x: 0, y: 15 }, { x: 1, y: 28 }, { x: 2, y: 40 },
        { x: 3, y: 55 }, { x: 4, y: 65 }, { x: 5, y: 72 },
      ],
      color: "#00d4ff",
    },
  ];
</script>

<Story name="Single" args={{ series: singleSeries }} />

<Story name="Stacked" args={{ stacked: true, series: stackedSeries }} />

<Story name="MultiSeries" args={{ series: multiSeries }} />
