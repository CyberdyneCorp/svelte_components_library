<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DescriptionList from "./DescriptionList.svelte";
  import type { DescriptionListItem } from "./types.js";
  import IconButton from "../../primitives/IconButton/IconButton.svelte";
  import CopyButton from "../../primitives/CopyButton/CopyButton.svelte";
  import StatusBadge from "../StatusBadge/StatusBadge.svelte";

  const { Story } = defineMeta({
    title: "Data/DescriptionList",
    component: DescriptionList,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
    argTypes: {
      columns: { control: "inline-radio", options: [1, 2] },
    },
  });

  const server: DescriptionListItem[] = [
    { id: "location", label: "Server location", value: "Brazil - São Paulo" },
    { id: "os", label: "Operating system", value: "Ubuntu 25.04" },
    { id: "hostname", label: "Hostname", value: "srv-example.cloud" },
    { id: "ipv4", label: "IPv4", value: "203.0.113.10" },
  ];

  const domain: DescriptionListItem[] = [
    { id: "status", label: "Status", value: "Active", hint: "Auto-renew on" },
    { id: "expires", label: "Expires", value: "12 Mar 2027" },
    { id: "nameservers", label: "Nameservers", value: "ns1.example.net, ns2.example.net" },
  ];
</script>

<Story name="Default" args={{ items: server }} />

<Story name="Two columns, no dividers" args={{ items: server, columns: 2, dividers: false }} />

<!-- An edit control per row; the accessible name includes the row label. -->
<Story name="With edit actions" asChild>
  <div style="max-width: 40rem;">
    <DescriptionList items={server}>
      {#snippet action(item)}
        <IconButton icon="settings" label={`Edit ${item.label}`} size="sm" />
      {/snippet}
    </DescriptionList>
  </div>
</Story>

<!-- Rich values through the `value` snippet; the hint renders under the value. -->
<Story name="Snippet values and hints" asChild>
  <div style="max-width: 40rem;">
    <DescriptionList items={domain}>
      {#snippet value(item)}
        {#if item.id === "status"}
          <StatusBadge status="active" label={item.value ?? ""} />
        {:else}
          {item.value}
        {/if}
      {/snippet}
      {#snippet action(item)}
        {#if item.id === "nameservers"}
          <CopyButton text={item.value ?? ""} label={`Copy ${item.label}`} size="sm" />
        {/if}
      {/snippet}
    </DescriptionList>
  </div>
</Story>

<Story name="Narrow width" asChild parameters={{ viewport: { defaultViewport: "mobile1" } }}>
  <div style="max-width: 360px;">
    <DescriptionList items={server} columns={2}>
      {#snippet action(item)}
        <IconButton icon="settings" label={`Edit ${item.label}`} size="sm" />
      {/snippet}
    </DescriptionList>
  </div>
</Story>
