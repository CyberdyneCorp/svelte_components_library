<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ChartFrame from "./ChartFrame.svelte";

  const { Story } = defineMeta({
    title: "Charts/ChartFrame",
    component: ChartFrame,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
  });

  const data = {
    columns: ["Month", "Income", "Spend"],
    rows: [
      ["Jan", 4200, 3100],
      ["Feb", 4300, 2900],
      ["Mar", 4250, 3350],
    ],
  };

  const bars = [
    { x: 20, h: 84 },
    { x: 70, h: 86 },
    { x: 120, h: 85 },
  ];
</script>

<Story name="Default" asChild>
  <ChartFrame title="Monthly income" description="Income held steady around 4,250 per month." {data}>
    {#snippet children(a11y)}
      <svg {...a11y} role="img" viewBox="0 0 170 100" width="170" height="100">
        {#each bars as bar (bar.x)}
          <rect x={bar.x} y={100 - bar.h} width="30" height={bar.h} fill="var(--color-action-brand-default)" />
        {/each}
      </svg>
    {/snippet}
  </ChartFrame>
</Story>

<Story name="TableExpanded" asChild>
  <ChartFrame title="Monthly income" {data} dataExpanded>
    {#snippet children(a11y)}
      <svg {...a11y} role="img" viewBox="0 0 170 100" width="170" height="100">
        {#each bars as bar (bar.x)}
          <rect x={bar.x} y={100 - bar.h} width="30" height={bar.h} fill="var(--color-action-brand-default)" />
        {/each}
      </svg>
    {/snippet}
  </ChartFrame>
</Story>

<Story name="HiddenTitle" asChild>
  <ChartFrame title="Monthly income" description="Shown to assistive tech only." hideTitle {data}>
    {#snippet children(a11y)}
      <svg {...a11y} role="img" viewBox="0 0 170 100" width="170" height="100">
        {#each bars as bar (bar.x)}
          <rect x={bar.x} y={100 - bar.h} width="30" height={bar.h} fill="var(--color-action-brand-default)" />
        {/each}
      </svg>
    {/snippet}
  </ChartFrame>
</Story>
