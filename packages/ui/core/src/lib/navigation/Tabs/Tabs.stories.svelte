<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Tabs from "./Tabs.svelte";

  const { Story } = defineMeta({
    title: "Navigation/Tabs",
    component: Tabs,
    tags: ["autodocs"],
  });
</script>

<script>
  let activeDefault = $state("overview");
  let activeThree = $state("models");
</script>

<Story name="Default">
  <Tabs
    items={[
      { id: "overview", label: "Overview" },
      { id: "transactions", label: "Transactions" },
    ]}
    bind:activeId={activeDefault}
  />
  <p style="color: var(--color-text-secondary); margin-top: 1rem; font-family: var(--font-mono); font-size: 0.8rem;">
    Active: {activeDefault}
  </p>
</Story>

<Story name="ThreeTabs">
  <Tabs
    items={[
      { id: "models", label: "Models" },
      { id: "datasets", label: "Datasets" },
      { id: "experiments", label: "Experiments" },
    ]}
    bind:activeId={activeThree}
  />
</Story>
