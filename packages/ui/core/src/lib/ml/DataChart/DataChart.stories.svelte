<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DataChart from "./DataChart.svelte";

  const { Story } = defineMeta({
    title: "ML/DataChart",
    component: DataChart,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ title: "Model Accuracy", description: "Accuracy over training epochs" }}>
  <div style="display: flex; align-items: flex-end; gap: 8px; height: 100%; width: 100%; padding: 0 16px;">
    {#each [35, 52, 68, 74, 81, 87, 91, 94, 96, 97] as val}
      <div style="flex: 1; height: {val}%; background: linear-gradient(180deg, var(--color-action-brand-default) 0%, var(--color-border-subtle) 100%); border-radius: 4px 4px 0 0; transition: height 300ms ease;"></div>
    {/each}
  </div>
</Story>

<Story name="Loading" args={{ title: "Training Metrics", description: "Waiting for data...", loading: true }} />

<Story name="Empty" args={{ title: "Inference Logs", empty: true, emptyMessage: "No inference data recorded yet" }} />
