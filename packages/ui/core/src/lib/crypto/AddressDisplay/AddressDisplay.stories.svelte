<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AddressDisplay from "./AddressDisplay.svelte";

  const { Story } = defineMeta({
    title: "Crypto/AddressDisplay",
    component: AddressDisplay,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ address: "0x1234567890abcdef1234567890abcdef12345678" }} />

<Story name="FullAddress" args={{ address: "0x1234567890abcdef1234567890abcdef12345678", truncate: false }} />

<Story name="WithLabel">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <AddressDisplay address="0x1234567890abcdef1234567890abcdef12345678" label="Wallet" size="md" />
    <AddressDisplay address="0xabcdef1234567890abcdef1234567890abcdef12" label="Contract" size="sm" />
  </div>
</Story>
