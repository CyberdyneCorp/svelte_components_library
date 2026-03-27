<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ContextMenu from "./ContextMenu.svelte";

  const { Story } = defineMeta({
    title: "Overlay/ContextMenu",
    component: ContextMenu,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <ContextMenu items={[
    { label: "Copy", onclick: () => console.log("copy") },
    { label: "Paste", onclick: () => console.log("paste") },
    { label: "Select All", onclick: () => console.log("select all") },
  ]}>
    <div style="
      padding: 2rem;
      border: 2px dashed var(--color-border-subtle);
      border-radius: var(--radius-md);
      text-align: center;
      color: var(--color-text-tertiary);
      font-family: var(--font-body);
      font-size: 0.875rem;
    ">
      Right-click here to open context menu
    </div>
  </ContextMenu>
</Story>

<Story name="WithIcons">
  <ContextMenu items={[
    { label: "Copy", icon: "copy", onclick: () => console.log("copy") },
    { label: "Edit", icon: "edit", onclick: () => console.log("edit") },
    { label: "Download", icon: "download", onclick: () => console.log("download") },
    { label: "Share", icon: "share", onclick: () => console.log("share") },
  ]}>
    <div style="
      padding: 2rem;
      border: 2px dashed var(--color-border-subtle);
      border-radius: var(--radius-md);
      text-align: center;
      color: var(--color-text-tertiary);
      font-family: var(--font-body);
      font-size: 0.875rem;
    ">
      Right-click for menu with icons
    </div>
  </ContextMenu>
</Story>

<Story name="WithDanger">
  <ContextMenu items={[
    { label: "Edit", icon: "edit", onclick: () => console.log("edit") },
    { label: "Download", icon: "download", onclick: () => console.log("download") },
    { label: "Delete", icon: "delete", onclick: () => console.log("delete"), variant: "danger" },
  ]}>
    <div style="
      padding: 2rem;
      border: 2px dashed var(--color-border-subtle);
      border-radius: var(--radius-md);
      text-align: center;
      color: var(--color-text-tertiary);
      font-family: var(--font-body);
      font-size: 0.875rem;
    ">
      Right-click for menu with danger action
    </div>
  </ContextMenu>
</Story>
