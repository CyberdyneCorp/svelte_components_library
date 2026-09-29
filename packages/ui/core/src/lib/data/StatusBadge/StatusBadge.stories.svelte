<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StatusBadge from "./StatusBadge.svelte";
  import Icon from "../../primitives/Icon/Icon.svelte";

  const { Story } = defineMeta({
    title: "Data Display/StatusBadge",
    component: StatusBadge,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for the badge.
      a11y: { test: "error" },
      docs: {
        description: {
          component:
            "Status label with a leading marker. Six statuses: `active`, `inactive`, `pending`, `error`, `warning`, `info`. `indicator=\"icon\"` gives each status its own icon shape and a default label, so badges stay distinguishable in grayscale (WCAG 1.4.1); the default `\"dot\"` keeps the original colour dot. `tone` overrides the colour and the `icon` snippet replaces the marker.",
        },
      },
    },
  });

  const statuses = ["active", "inactive", "pending", "error", "warning", "info"] as const;
</script>

<Story name="AllStatuses">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <StatusBadge status="active" label="Node Online" />
    <StatusBadge status="inactive" label="Node Offline" />
    <StatusBadge status="pending" label="Syncing..." />
    <StatusBadge status="error" label="Connection Lost" />
    <StatusBadge status="warning" label="Low Balance" />
    <StatusBadge status="info" label="Read Only" />
  </div>
</Story>

<Story name="IconIndicator">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    {#each statuses as status (status)}
      <StatusBadge {status} indicator="icon" />
    {/each}
  </div>
</Story>

<Story name="Grayscale">
  <div style="display: flex; flex-direction: column; gap: 1rem; filter: grayscale(1);">
    {#each statuses as status (status)}
      <StatusBadge {status} indicator="icon" />
    {/each}
  </div>
</Story>

<Story name="ToneAndCustomIcon">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <StatusBadge status="pending" tone="info" indicator="icon" label="Queued" />
    <StatusBadge status="active" label="Encrypted">
      {#snippet icon()}<Icon name="lock" size={14} />{/snippet}
    </StatusBadge>
  </div>
</Story>

<Story name="Calm" globals={{ theme: "calm" }}>
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    {#each statuses as status (status)}
      <StatusBadge {status} indicator="icon" />
    {/each}
  </div>
</Story>

<Story name="CalmDark" globals={{ theme: "calm-dark" }}>
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    {#each statuses as status (status)}
      <StatusBadge {status} indicator="icon" />
    {/each}
  </div>
</Story>
