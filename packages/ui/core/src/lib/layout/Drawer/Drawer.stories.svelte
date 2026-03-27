<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Drawer from "./Drawer.svelte";

  const { Story } = defineMeta({
    title: "Layout/Drawer",
    component: Drawer,
    tags: ["autodocs"],
  });
</script>

<Story name="RightSide" args={{
  open: true,
  title: "System Logs",
}} />

<Story name="LeftSide" args={{
  open: true,
  side: "left",
  title: "Navigation",
  width: "320px",
}} />

<Story name="WithFooter" args={{
  open: true,
  title: "Export Configuration",
}} />
