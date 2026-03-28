<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TransactionConfirm from "./TransactionConfirm.svelte";

  const { Story } = defineMeta({
    title: "Crypto/TransactionConfirm",
    component: TransactionConfirm,
    tags: ["autodocs"],
  });
</script>

<Story name="Send" args={{
  open: true,
  type: "send",
  fromLabel: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68",
  toLabel: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  amount: "1.5",
  token: "ETH",
  gasEstimate: "0.0021",
  networkName: "Ethereum",
}} />

<Story name="Swap" args={{
  open: true,
  type: "swap",
  fromLabel: "1.5 ETH",
  toLabel: "2,847.50 USDC",
  amount: "1.5",
  token: "ETH",
  gasEstimate: "0.0035",
  networkName: "Ethereum",
}} />

<Story name="WithHighGas" args={{
  open: true,
  type: "send",
  fromLabel: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68",
  toLabel: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  amount: "0.5",
  token: "ETH",
  gasEstimate: "0.0850",
  networkName: "Ethereum",
}} />
