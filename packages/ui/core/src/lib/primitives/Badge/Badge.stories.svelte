<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Badge from "./Badge.svelte";

  const { Story } = defineMeta({
    title: "Primitives/Badge",
    component: Badge,
    tags: ["autodocs"],
  });
</script>

<Story name="AllVariants">
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <Badge variant="success">Online</Badge>
    <Badge variant="warning">Pending</Badge>
    <Badge variant="error">Error</Badge>
    <Badge variant="info">Syncing</Badge>
    <Badge variant="neutral">Draft</Badge>
  </div>
</Story>

<Story name="Sizes">
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <Badge variant="success" size="sm">SM</Badge>
    <Badge variant="success" size="md">MD</Badge>
    <Badge variant="info" size="sm">SM</Badge>
    <Badge variant="info" size="md">MD</Badge>
  </div>
</Story>
