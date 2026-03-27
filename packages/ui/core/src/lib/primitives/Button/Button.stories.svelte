<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Button from "./Button.svelte";

  const { Story } = defineMeta({
    title: "Primitives/Button",
    component: Button,
    tags: ["autodocs"],
  });
</script>

<Story name="Brand">
  <Button variant="brand">Brand Action</Button>
</Story>

<Story name="Secondary">
  <Button variant="secondary">Secondary</Button>
</Story>

<Story name="Outline">
  <Button variant="outline">Outline</Button>
</Story>

<Story name="Ghost">
  <Button variant="ghost">Ghost</Button>
</Story>

<Story name="Danger">
  <Button variant="danger">Delete</Button>
</Story>

<Story name="Sizes">
  <div style="display: flex; align-items: center; gap: 1rem;">
    <Button variant="brand" size="sm">Small</Button>
    <Button variant="brand" size="md">Medium</Button>
    <Button variant="brand" size="lg">Large</Button>
  </div>
</Story>

<Story name="Loading">
  <div style="display: flex; align-items: center; gap: 1rem;">
    <Button variant="brand" loading>Loading...</Button>
    <Button variant="secondary" loading>Processing</Button>
    <Button variant="danger" loading>Deleting</Button>
  </div>
</Story>

<Story name="Disabled">
  <div style="display: flex; align-items: center; gap: 1rem;">
    <Button variant="brand" disabled>Disabled</Button>
    <Button variant="secondary" disabled>Disabled</Button>
    <Button variant="outline" disabled>Disabled</Button>
    <Button variant="ghost" disabled>Disabled</Button>
    <Button variant="danger" disabled>Disabled</Button>
  </div>
</Story>
