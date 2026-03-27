<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ThemeToggle from "./ThemeToggle.svelte";

  const { Story } = defineMeta({
    title: "Primitives/ThemeToggle",
    component: ThemeToggle,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ theme: "dark" }} />

<Story name="Light" args={{ theme: "light" }} />

<Story name="Small" args={{ theme: "dark", size: "sm" }} />
