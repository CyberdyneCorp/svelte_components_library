<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Dialog from "./Dialog.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Dialog",
    component: Dialog,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  open: true,
  title: "Confirm Transaction",
  onconfirm: () => console.log('confirmed'),
  oncancel: () => console.log('cancelled'),
}} />

<Story name="Danger" args={{
  open: true,
  title: "Delete Model",
  variant: "danger",
  confirmLabel: "Delete",
  onconfirm: () => console.log('deleted'),
  oncancel: () => console.log('cancelled'),
}} />
