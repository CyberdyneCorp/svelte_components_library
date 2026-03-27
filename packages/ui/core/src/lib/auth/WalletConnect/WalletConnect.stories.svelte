<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WalletConnect from "./WalletConnect.svelte";

  const { Story } = defineMeta({
    title: "Auth/WalletConnect",
    component: WalletConnect,
    tags: ["autodocs"],
  });

  const customWallets = [
    { id: "metamask", name: "MetaMask", icon: "metamask", description: "Most popular EVM wallet" },
    { id: "phantom", name: "Phantom", icon: "phantom", description: "Solana & multi-chain" },
  ];
</script>

<Story name="Default" args={{ onconnect: (id) => console.log("Connect:", id) }} />

<Story name="Custom Wallets" args={{
  wallets: customWallets,
  onconnect: (id) => console.log("Connect:", id),
}} />

<Story name="Connecting" args={{ connecting: "metamask" }} />
