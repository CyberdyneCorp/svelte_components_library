<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PromptExample from "./PromptExample.svelte";

  const { Story } = defineMeta({
    title: "Chat/PromptExample",
    component: PromptExample,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <PromptExample
    title="Check wallet balance"
    description="View your current token balances across chains"
    onclick={() => console.log("clicked")}
  />
</Story>

<Story name="Grid">
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; max-width: 500px;">
    <PromptExample title="Check gas prices" description="View current network fees" />
    <PromptExample title="Swap tokens" description="Exchange one token for another" />
    <PromptExample title="View NFTs" description="Browse your NFT collection" />
    <PromptExample title="Send crypto" description="Transfer tokens to another wallet" />
  </div>
</Story>
