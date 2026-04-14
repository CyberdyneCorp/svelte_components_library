<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StartMenu from "./StartMenu.svelte";

  const { Story } = defineMeta({
    title: "Retro/StartMenu",
    component: StartMenu,
    tags: ["autodocs"],
  });

  const items = [
    { id: "team", label: "Our Team", icon: "👥" },
    { id: "terminal", label: "Terminal", icon: "💻" },
    { id: "close", label: "Close All Windows", icon: "❌" },
  ];
</script>

<Story name="Default" args={{ items, label: "Start", header: "Menu" }} />

<Story name="Open" args={{ items, label: "Start", header: "Menu", open: true }} />
