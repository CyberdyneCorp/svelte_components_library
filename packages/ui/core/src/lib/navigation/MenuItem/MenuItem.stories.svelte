<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MenuItem from "./MenuItem.svelte";

  const { Story } = defineMeta({
    title: "Navigation/MenuItem",
    component: MenuItem,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="width: 240px; background: #0a0a0f; padding: 0.5rem 0;">
    <MenuItem label="Dashboard" icon="📊" />
  </div>
</Story>

<Story name="Active">
  <div style="width: 240px; background: #0a0a0f; padding: 0.5rem 0;">
    <MenuItem label="Dashboard" icon="📊" active />
  </div>
</Story>

<Story name="Navigation">
  <div style="width: 240px; background: #0a0a0f; padding: 0.5rem 0;">
    <MenuItem label="Dashboard" icon="📊" active />
    <MenuItem label="Transactions" icon="💸" />
    <MenuItem label="Settings" icon="⚙️" />
    <MenuItem label="Help" icon="❓" />
  </div>
</Story>

<Story name="WithSubItems">
  <div style="width: 240px; background: #0a0a0f; padding: 0.5rem 0;">
    <MenuItem label="Settings" icon="⚙️" active>
      <MenuItem label="Profile" />
      <MenuItem label="Security" />
      <MenuItem label="Notifications" />
    </MenuItem>
  </div>
</Story>
