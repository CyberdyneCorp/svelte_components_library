<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NetworkBadge from "./NetworkBadge.svelte";

  const { Story } = defineMeta({
    title: "Crypto/NetworkBadge",
    component: NetworkBadge,
    tags: ["autodocs"],
  });
</script>

<Story name="Ethereum" args={{ network: "Ethereum", chainId: 1, connected: true }} />

<Story name="Polygon" args={{ network: "Polygon", chainId: 137, connected: true }} />

<Story name="Disconnected">
  <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start;">
    <NetworkBadge network="Ethereum" chainId={1} connected={false} />
    <NetworkBadge network="Arbitrum" chainId={42161} connected={false} />
  </div>
</Story>
