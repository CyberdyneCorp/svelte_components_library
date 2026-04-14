<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import RetroContextMenu from "./RetroContextMenu.svelte";
  const { Story } = defineMeta({ title: "Retro/RetroContextMenu", component: RetroContextMenu, tags: ["autodocs"] });
</script>

<Story name="Open" args={{
  open: true,
  x: 40,
  y: 40,
  items: [
    { id: "copy", label: "Copy", icon: "📋", shortcut: "⌘C" },
    { id: "paste", label: "Paste", icon: "📋", shortcut: "⌘V" },
    { id: "sep", label: "", separator: true },
    { id: "delete", label: "Delete", icon: "🗑", shortcut: "⌫" },
    { id: "props", label: "Properties", disabled: true },
  ],
}} />
