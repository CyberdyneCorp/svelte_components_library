<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MultiSelect from "./MultiSelect.svelte";

  const { Story } = defineMeta({
    title: "Forms/MultiSelect",
    component: MultiSelect,
    tags: ["autodocs"],
  });

  const defaultOptions = [
    { value: "eth", label: "Ethereum" },
    { value: "btc", label: "Bitcoin" },
    { value: "sol", label: "Solana" },
    { value: "avax", label: "Avalanche" },
    { value: "matic", label: "Polygon" },
    { value: "arb", label: "Arbitrum" },
  ];

  const groupedOptions = [
    { value: "eth", label: "Ethereum", group: "Layer 1" },
    { value: "btc", label: "Bitcoin", group: "Layer 1" },
    { value: "sol", label: "Solana", group: "Layer 1" },
    { value: "arb", label: "Arbitrum", group: "Layer 2" },
    { value: "op", label: "Optimism", group: "Layer 2" },
    { value: "matic", label: "Polygon", group: "Layer 2" },
    { value: "usdc", label: "USDC", group: "Stablecoins" },
    { value: "dai", label: "DAI", group: "Stablecoins" },
  ];
</script>

<Story name="Default" args={{ label: "Select Networks", options: defaultOptions }} />

<Story name="WithGroups" args={{ label: "Select Assets", options: groupedOptions }} />

<Story name="MaxItems" args={{ label: "Select Networks (max 3)", options: defaultOptions, maxItems: 3 }} />

<Story name="Searchable" args={{ label: "Search & Select", options: groupedOptions, searchable: true, placeholder: "Type to search..." }} />
