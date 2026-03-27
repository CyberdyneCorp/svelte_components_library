<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MenuItem from "./MenuItem.svelte";

  const { Story } = defineMeta({
    title: "Navigation/MenuItem",
    component: MenuItem,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ label: "Dashboard", icon: "terminal" }} />

<Story name="Active" args={{ label: "Dashboard", icon: "terminal", active: true }} />

<Story name="Navigation">
  <div style="width: 240px; background: #0a0a0f; padding: 0.5rem 0;">
    <MenuItem label="Dashboard" icon="terminal" active />
    <MenuItem label="Transactions" icon="activity" />
    <MenuItem label="Settings" icon="settings" />
    <MenuItem label="Help" icon="info" />
  </div>
</Story>

<Story name="WithSubItems">
  <div style="width: 240px; background: #0a0a0f; padding: 0.5rem 0;">
    <MenuItem label="Settings" icon="settings" active>
      <MenuItem label="Profile" />
      <MenuItem label="Security" />
      <MenuItem label="Notifications" />
    </MenuItem>
  </div>
</Story>
