<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SettingsRow from "./SettingsRow.svelte";
  import Button from "../../primitives/Button/Button.svelte";
  import Icon from "../../primitives/Icon/Icon.svelte";
  import Switch from "../../forms/Switch/Switch.svelte";

  const { Story } = defineMeta({
    title: "Data/SettingsRow",
    component: SettingsRow,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
    argTypes: {
      as: { control: "inline-radio", options: ["div", "li"] },
      badgeVariant: {
        control: "select",
        options: ["success", "warning", "error", "danger", "info", "neutral"],
      },
    },
  });
</script>

<Story
  name="Default"
  args={{
    title: "DNS resolvers",
    description: "Use the defaults or add your own.",
    badge: "Custom",
    badgeVariant: "info",
  }}
/>

<Story name="Minimal" args={{ title: "Firewall" }} />

<!-- Icon, badge and two actions; the actions wrap below the text under 640px. -->
<Story name="With icon and actions" asChild>
  <div
    style="max-width: 40rem; border: 1px solid var(--color-border-default); border-radius: var(--radius-lg); background: var(--color-surface-default);"
  >
    <SettingsRow
      title="DNS resolvers"
      description="Use the defaults or add your own."
      badge="Custom"
      badgeVariant="info"
      data-setting="dns"
    >
      {#snippet icon()}
        <Icon name="settings" size={18} />
      {/snippet}
      {#snippet actions()}
        <Button variant="ghost" size="sm">Reset to defaults</Button>
        <Button variant="secondary" size="sm">Add resolver</Button>
      {/snippet}
    </SettingsRow>
  </div>
</Story>

{#snippet settingsList()}
  <ul
    style="max-width: 40rem; margin: 0; padding: 0; border: 1px solid var(--color-border-default); border-radius: var(--radius-lg); background: var(--color-surface-default);"
  >
    <SettingsRow
      as="li"
      title="SSH access"
      description="Allow key-based logins on port 22."
      data-setting="ssh"
    >
      {#snippet icon()}
        <Icon name="terminal" size={18} />
      {/snippet}
      {#snippet actions()}
        <Switch label="SSH access" checked />
      {/snippet}
    </SettingsRow>
    <SettingsRow
      as="li"
      title="Firewall"
      badge="Recommended"
      badgeVariant="success"
      data-setting="firewall"
    >
      {#snippet icon()}
        <Icon name="shield" size={18} />
      {/snippet}
      <span
        >Blocks everything except ports <code>80</code>, <code>443</code> and <code>22</code>.</span
      >
      {#snippet actions()}
        <Button variant="outline" size="sm">Manage rules</Button>
      {/snippet}
    </SettingsRow>
    <SettingsRow
      as="li"
      title="Automatic backups"
      description="Daily snapshots kept for 7 days."
      badge="Paid"
      badgeVariant="warning"
      data-setting="backups"
    >
      {#snippet icon()}
        <Icon name="clock" size={18} />
      {/snippet}
      {#snippet actions()}
        <Button variant="brand" size="sm">Upgrade</Button>
      {/snippet}
    </SettingsRow>
  </ul>
{/snippet}

<Story name="Settings list" asChild>
  {@render settingsList()}
</Story>

<Story name="Narrow width" asChild parameters={{ viewport: { defaultViewport: "mobile1" } }}>
  <div style="max-width: 360px;">
    {@render settingsList()}
  </div>
</Story>
