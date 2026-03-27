<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StatusBadge from "./StatusBadge.svelte";

  const { Story } = defineMeta({
    title: "Data Display/StatusBadge",
    component: StatusBadge,
    tags: ["autodocs"],
  });
</script>

<Story name="AllStatuses">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <StatusBadge status="active" label="Node Online" />
    <StatusBadge status="inactive" label="Node Offline" />
    <StatusBadge status="pending" label="Syncing..." />
    <StatusBadge status="error" label="Connection Lost" />
  </div>
</Story>
