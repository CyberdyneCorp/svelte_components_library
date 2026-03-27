<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Sidebar from "./Sidebar.svelte";

  const { Story } = defineMeta({
    title: "Navigation/Sidebar",
    component: Sidebar,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="height: 400px;">
    <Sidebar
      activeId="dashboard"
      items={[
        { id: "dashboard", label: "Dashboard", icon: ">" },
        { id: "models", label: "Models", icon: "M" },
        { id: "datasets", label: "Datasets", icon: "D" },
        { id: "settings", label: "Settings", icon: "S" },
      ]}
    />
  </div>
</Story>

<Story name="Collapsed">
  <div style="height: 400px;">
    <Sidebar
      collapsed
      activeId="dashboard"
      items={[
        { id: "dashboard", label: "Dashboard", icon: ">" },
        { id: "models", label: "Models", icon: "M" },
        { id: "datasets", label: "Datasets", icon: "D" },
        { id: "settings", label: "Settings", icon: "S" },
      ]}
    />
  </div>
</Story>

<Story name="WithSubItems">
  <div style="height: 500px;">
    <Sidebar
      activeId="train"
      items={[
        { id: "dashboard", label: "Dashboard", icon: ">" },
        {
          id: "models", label: "Models", icon: "M",
          children: [
            { id: "train", label: "Training" },
            { id: "eval", label: "Evaluation" },
            { id: "deploy", label: "Deployment" },
          ]
        },
        {
          id: "data", label: "Data", icon: "D",
          children: [
            { id: "upload", label: "Upload" },
            { id: "explore", label: "Explore" },
          ]
        },
        { id: "settings", label: "Settings", icon: "S" },
      ]}
    />
  </div>
</Story>
