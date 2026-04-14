<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import RetroWindow from "./RetroWindow.svelte";

  const { Story } = defineMeta({
    title: "Retro/RetroWindow",
    component: RetroWindow,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ open: true, title: "Terminal", x: 40, y: 40, width: 640, height: 360 }} />

<Story name="NoFooter" args={{ open: true, title: "Team", x: 40, y: 40, width: 520, height: 320, showFooter: false }} />

<Story name="NotResizable" args={{ open: true, title: "Info", x: 40, y: 40, resizable: false }} />
