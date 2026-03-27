<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Tabs from "./Tabs.svelte";

  const { Story } = defineMeta({
    title: "Navigation/Tabs",
    component: Tabs,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  items: [
    { id: "overview", label: "Overview" },
    { id: "transactions", label: "Transactions" },
  ],
  activeId: "overview",
}} />

<Story name="ThreeTabs" args={{
  items: [
    { id: "models", label: "Models" },
    { id: "datasets", label: "Datasets" },
    { id: "experiments", label: "Experiments" },
  ],
  activeId: "models",
}} />
