<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Kbd from "./Kbd.svelte";

  const { Story } = defineMeta({
    title: "ML/Kbd",
    component: Kbd,
    tags: ["autodocs"],
  });
</script>

<Story name="SingleKey" args={{ keys: ["Enter"] }} />

<Story name="Combination" args={{ keys: ["Ctrl", "C"] }} />

<Story name="ModifierKeys" args={{ keys: ["Cmd", "K"] }} />
