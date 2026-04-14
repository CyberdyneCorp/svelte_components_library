<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Taskbar from "./Taskbar.svelte";

  const { Story } = defineMeta({
    title: "Retro/Taskbar",
    component: Taskbar,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  items: [
    { id: "term", label: "Terminal", icon: "💻", active: true },
    { id: "team", label: "Team", icon: "👥" },
    { id: "bag", label: "Your Bag", icon: "🛍️" },
  ],
}} />

<Story name="Empty" args={{ items: [] }} />

<Story name="WithMinimized" args={{
  items: [
    { id: "a", label: "Active Window", active: true },
    { id: "b", label: "Minimized Window", minimized: true },
  ],
}} />
