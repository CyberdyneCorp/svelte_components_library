<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MenuBar from "./MenuBar.svelte";

  const { Story } = defineMeta({
    title: "Navigation/MenuBar",
    component: MenuBar,
    tags: ["autodocs"],
  });

  const defaultMenus = [
    {
      label: "File",
      items: [
        { label: "New", action: "file.new", shortcut: "Ctrl+N" },
        { label: "Open", action: "file.open", shortcut: "Ctrl+O" },
        { label: "Save", action: "file.save", shortcut: "Ctrl+S" },
        { label: "Save As", action: "file.saveAs", shortcut: "Ctrl+Shift+S" },
        { label: "", separator: true },
        { label: "Export", action: "file.export" },
        { label: "", separator: true },
        { label: "Close", action: "file.close", shortcut: "Ctrl+W" },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", action: "edit.undo", shortcut: "Ctrl+Z" },
        { label: "Redo", action: "edit.redo", shortcut: "Ctrl+Shift+Z" },
        { label: "", separator: true },
        { label: "Cut", action: "edit.cut", shortcut: "Ctrl+X" },
        { label: "Copy", action: "edit.copy", shortcut: "Ctrl+C" },
        { label: "Paste", action: "edit.paste", shortcut: "Ctrl+V" },
        { label: "", separator: true },
        { label: "Find", action: "edit.find", shortcut: "Ctrl+F" },
      ],
    },
    {
      label: "View",
      items: [
        { label: "Sidebar", action: "view.sidebar" },
        { label: "Terminal", action: "view.terminal" },
        { label: "", separator: true },
        { label: "Zoom In", action: "view.zoomIn", shortcut: "Ctrl++" },
        { label: "Zoom Out", action: "view.zoomOut", shortcut: "Ctrl+-" },
        { label: "Reset Zoom", action: "view.resetZoom" },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "Documentation", action: "help.docs" },
        { label: "About", action: "help.about", disabled: true },
      ],
    },
  ];
</script>

<Story name="Default" args={{
  menus: defaultMenus,
}} />
