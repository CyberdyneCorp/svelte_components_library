<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TagInput from "./TagInput.svelte";

  const { Story } = defineMeta({
    title: "Forms/TagInput",
    component: TagInput,
    tags: ["autodocs"],
  });

  const blockchainSuggestions = [
    "DeFi", "NFT", "DAO", "Layer2", "Bridge", "Staking",
    "Yield", "Governance", "Oracle", "AMM", "Lending", "DEX",
  ];
</script>

<Story name="Default">
  <TagInput label="Tags" placeholder="Add a tag..." />
</Story>

<Story name="WithSuggestions">
  <TagInput label="Categories" placeholder="Type to see suggestions..." suggestions={blockchainSuggestions} />
</Story>

<Story name="MaxTags">
  <TagInput label="Keywords (max 5)" placeholder="Add keyword..." maxTags={5} suggestions={blockchainSuggestions} />
</Story>
