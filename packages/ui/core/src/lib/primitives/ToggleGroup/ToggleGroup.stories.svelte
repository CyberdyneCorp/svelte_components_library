<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ToggleGroup from "./ToggleGroup.svelte";

  const { Story } = defineMeta({
    title: "Primitives/ToggleGroup",
    component: ToggleGroup,
    tags: ["autodocs"],
  });

  const defaultOptions = [
    { value: "edit", label: "Edit" },
    { value: "split", label: "Split" },
    { value: "preview", label: "Preview" },
  ];

  const iconOptions = [
    { value: "list", label: "List", icon: "☰" },
    { value: "grid", label: "Grid", icon: "⊞" },
    { value: "kanban", label: "Kanban", icon: "▥" },
  ];
</script>

<Story name="Default" args={{ options: defaultOptions, value: "split" }} />

<Story name="Small" args={{ options: defaultOptions, value: "edit", size: "sm" }} />

<Story name="WithIcons" args={{ options: iconOptions, value: "grid" }} />

<Story name="Multiple">
  {@const gdacs = [
    { value: "EQ", label: "Quake" },
    { value: "TC", label: "Cyclone" },
    { value: "FL", label: "Flood" },
    { value: "DR", label: "Drought" },
    { value: "WF", label: "Wildfire" },
  ]}
  <ToggleGroup
    multiple
    options={gdacs}
    value={["EQ", "FL"]}
    onchange={(v) => console.log("active types:", v)}
  />
</Story>
