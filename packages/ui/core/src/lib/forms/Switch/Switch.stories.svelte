<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Switch from "./Switch.svelte";

  const { Story } = defineMeta({
    title: "Forms/Switch",
    component: Switch,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <Switch label="Enable dark mode" />
</Story>

<Story name="On">
  <Switch label="Real-time sync" checked={true} />
</Story>

<Story name="Disabled">
  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
    <Switch label="Disabled off" disabled />
    <Switch label="Disabled on" checked={true} disabled />
  </div>
</Story>
