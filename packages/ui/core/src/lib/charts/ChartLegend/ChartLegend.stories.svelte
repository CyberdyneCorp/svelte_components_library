<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ChartLegend from "./ChartLegend.svelte";
  import { seriesStyle } from "./markers.js";

  const { Story } = defineMeta({
    title: "Charts/ChartLegend",
    component: ChartLegend,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
  });

  const colors = ["#00ff41", "#00d4ff", "#bf5af2", "#ffb800", "#ff5555", "#50fa7b"];
  const names = ["Income", "Rent", "Groceries", "Transport", "Leisure", "Savings"];
  const items = names.map((label, i) => ({ label, color: colors[i], ...seriesStyle(i) }));
</script>

<Story name="Markers" args={{ items }} />

<Story name="WithLineSamples" args={{ items, showLine: true, ariaLabel: "Series" }} />

<Story name="WithDetails" args={{ items: items.slice(0, 3).map((item, i) => ({ ...item, detail: `${[50, 30, 20][i]}%` })) }} />

<Story name="Grayscale" asChild>
  <div style="filter: grayscale(1);">
    <ChartLegend {items} showLine />
  </div>
</Story>
