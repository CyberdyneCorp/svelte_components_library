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

<Story name="Default" args={{ label: "Tags", placeholder: "Add a tag..." }} />

<Story name="WithSuggestions" args={{ label: "Categories", placeholder: "Type to see suggestions...", suggestions: blockchainSuggestions }} />

<Story name="MaxTags" args={{ label: "Keywords (max 5)", placeholder: "Add keyword...", maxTags: 5, suggestions: blockchainSuggestions }} />
