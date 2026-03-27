<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WalletConnect from "./WalletConnect.svelte";

  const { Story } = defineMeta({
    title: "Auth/WalletConnect",
    component: WalletConnect,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="padding: 2rem; background: var(--color-bg-primary); min-height: 400px; display: flex; align-items: center; justify-content: center;">
    <WalletConnect onconnect={(id) => console.log("Connect:", id)} />
  </div>
</Story>

<Story name="Custom Wallets">
  <div style="padding: 2rem; background: var(--color-bg-primary); min-height: 400px; display: flex; align-items: center; justify-content: center;">
    <WalletConnect
      wallets={[
        { id: "metamask", name: "MetaMask", icon: "metamask", description: "Most popular EVM wallet" },
        { id: "phantom", name: "Phantom", icon: "phantom", description: "Solana & multi-chain" },
      ]}
      onconnect={(id) => console.log("Connect:", id)}
    />
  </div>
</Story>

<Story name="Connecting">
  <div style="padding: 2rem; background: var(--color-bg-primary); min-height: 400px; display: flex; align-items: center; justify-content: center;">
    <WalletConnect connecting="metamask" />
  </div>
</Story>
