<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import InformationPill from "./InformationPill.svelte";

  const { Story } = defineMeta({
    title: "Primitives/InformationPill",
    component: InformationPill,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <InformationPill label="Gas:" value="25 gwei" />
</Story>

<Story name="Brand">
  <InformationPill label="Balance:" value="1.45 ETH" variant="brand" />
</Story>

<Story name="Info">
  <InformationPill label="Network:" value="Ethereum" variant="info" />
</Story>

<Story name="AllVariants">
  <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
    <InformationPill label="Gas:" value="25 gwei" />
    <InformationPill label="Balance:" value="1.45 ETH" variant="brand" />
    <InformationPill label="Network:" value="Ethereum" variant="info" />
    <InformationPill label="Block:" value="#18,234,567" variant="brand" />
  </div>
</Story>
