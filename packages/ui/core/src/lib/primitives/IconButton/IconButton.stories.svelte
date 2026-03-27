<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import IconButton from "./IconButton.svelte";

  const { Story } = defineMeta({
    title: "Primitives/IconButton",
    component: IconButton,
    tags: ["autodocs"],
  });
</script>

<Story name="Ghost">
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <IconButton icon="settings" label="Settings" variant="ghost" />
    <IconButton icon="search" label="Search" variant="ghost" />
    <IconButton icon="menu" label="Menu" variant="ghost" />
    <IconButton icon="x" label="Close" variant="ghost" />
  </div>
</Story>

<Story name="Outline">
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <IconButton icon="plus" label="Add" variant="outline" />
    <IconButton icon="copy" label="Copy" variant="outline" />
    <IconButton icon="external-link" label="Open" variant="outline" />
  </div>
</Story>

<Story name="Sizes">
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <IconButton icon="zap" label="Small" variant="outline" size="sm" />
    <IconButton icon="zap" label="Medium" variant="outline" size="md" />
    <IconButton icon="zap" label="Large" variant="outline" size="lg" />
  </div>
</Story>
