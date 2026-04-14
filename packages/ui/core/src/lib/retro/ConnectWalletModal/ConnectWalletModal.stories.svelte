<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ConnectWalletModal from "./ConnectWalletModal.svelte";

  const { Story } = defineMeta({
    title: "Retro/ConnectWalletModal",
    component: ConnectWalletModal,
    tags: ["autodocs"],
  });

  const providers = [
    { id: "wc", name: "WalletConnect", description: "Connect MetaMask, Trust Wallet & 50+ wallets", icon: "📱" },
    { id: "google", name: "Continue with Google", description: "Secure authentication via Google", icon: "G" },
  ];
</script>

<Story name="Default" args={{ open: true, providers }} />

<Story name="WithDisabled" args={{
  open: true,
  providers: [
    ...providers,
    { id: "coinbase", name: "Coinbase (coming soon)", description: "Not yet available", icon: "C", disabled: true },
  ],
}} />
