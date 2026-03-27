<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import EmptyState from "./EmptyState.svelte";

  const { Story } = defineMeta({
    title: "Data Display/EmptyState",
    component: EmptyState,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  title: "No models found",
  description: "You haven't trained any models yet. Start by uploading a dataset.",
  icon: "terminal",
}} />

<Story name="WithAction">
  <EmptyState
    title="No data available"
    description="Import your first dataset to begin running experiments."
    icon="data"
  >
    <button style="
      padding: 0.5rem 1rem;
      background: var(--btn-brand-bg);
      color: var(--btn-brand-text);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 500;
    ">
      Import Dataset
    </button>
  </EmptyState>
</Story>
