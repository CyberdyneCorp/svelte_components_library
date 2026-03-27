<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Modal from "./Modal.svelte";

  const { Story } = defineMeta({
    title: "Overlay/Modal",
    component: Modal,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  open: true,
  title: "Model Configuration",
}} />

<Story name="Large" args={{
  open: true,
  title: "Dataset Preview",
  size: "lg",
}} />

<Story name="WithFooter" args={{
  open: true,
  title: "Export Results",
}} />
