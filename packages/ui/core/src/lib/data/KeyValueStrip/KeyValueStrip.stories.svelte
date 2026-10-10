<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import KeyValueStrip from "./KeyValueStrip.svelte";

  const { Story } = defineMeta({
    title: "Data Display/KeyValueStrip",
    component: KeyValueStrip,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
  });

  const sshItems = [
    { id: "user", label: "SSH username", value: "root", copy: true },
    { id: "ipv4", label: "IPv4", value: "203.0.113.10", copy: true },
    { id: "ipv6", label: "IPv6", value: "2001:db8::10", copy: true },
    {
      id: "reset",
      label: "Forgot the root password?",
      value: "Reset",
      href: "#reset",
      linkLabel: "Reset password",
    },
  ];
</script>

<Story name="Default" args={{ items: sshItems, ariaLabel: "SSH access" }} />

<!-- `copyLabel` and every label are application strings, so the strip translates without code changes. -->
<Story
  name="Translated"
  args={{
    ariaLabel: "Acesso SSH",
    copyLabel: "Copiar",
    items: [
      { id: "user", label: "Nome de usuário SSH", value: "root", copy: true },
      { id: "ipv4", label: "IPv4", value: "203.0.113.10", copy: true },
      {
        id: "reset",
        label: "Esqueceu a senha root?",
        value: "Redefinir",
        href: "#reset",
        linkLabel: "Redefinir senha",
      },
    ],
  }}
/>

<Story
  name="Plain facts"
  args={{
    ariaLabel: "Server",
    items: [
      { id: "location", label: "Location", value: "Brazil - São Paulo" },
      { id: "os", label: "OS", value: "Ubuntu 25.04" },
      { id: "host", label: "Hostname", value: "srv-example.cloud", href: "#host" },
    ],
  }}
/>

<!-- Items wrap onto new lines at phone widths; dividers only separate neighbours on the same row. -->
<Story name="Narrow width" asChild>
  <div
    style="max-width: 320px; padding: var(--space-2); border: 1px dashed var(--color-border-default);"
  >
    <KeyValueStrip items={sshItems} ariaLabel="SSH access" />
  </div>
</Story>
