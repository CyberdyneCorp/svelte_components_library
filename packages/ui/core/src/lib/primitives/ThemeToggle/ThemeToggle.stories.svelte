<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ThemeToggle from "./ThemeToggle.svelte";

  const { Story } = defineMeta({
    title: "Primitives/ThemeToggle",
    component: ThemeToggle,
    tags: ["autodocs"],
    argTypes: {
      includeSystem: { control: "boolean" },
      size: { control: "select", options: ["sm", "md"] },
    },
  });
</script>

<Story name="Default" args={{ theme: "dark", persistKey: "" }} />

<Story name="Light" args={{ theme: "light", persistKey: "" }} />

<Story name="Small" args={{ theme: "dark", size: "sm", persistKey: "" }} />

<Story name="With System" args={{ includeSystem: true, persistKey: "" }} />

<Story
  name="Calm Themes With System"
  args={{
    includeSystem: true,
    themes: { light: "calm", dark: "calm-dark" },
    ariaLabel: "Appearance",
    persistKey: "",
  }}
/>

<Story name="With System Small" args={{ includeSystem: true, size: "sm", persistKey: "" }} />
