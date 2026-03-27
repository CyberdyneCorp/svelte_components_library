<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Sidebar from "./Sidebar.svelte";

  const defaultSidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: ">" },
    { id: "models", label: "Models", icon: "M" },
    { id: "datasets", label: "Datasets", icon: "D" },
    { id: "settings", label: "Settings", icon: "S" },
  ];

  const subItemsSidebarItems = [
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
  ];

  const { Story } = defineMeta({
    title: "Navigation/Sidebar",
    component: Sidebar,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ activeId: "dashboard", items: defaultSidebarItems }} />

<Story name="Collapsed" args={{ collapsed: true, activeId: "dashboard", items: defaultSidebarItems }} />

<Story name="WithSubItems" args={{ activeId: "train", items: subItemsSidebarItems }} />
