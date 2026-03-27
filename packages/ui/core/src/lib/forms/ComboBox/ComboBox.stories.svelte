<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ComboBox from "./ComboBox.svelte";

  const { Story } = defineMeta({
    title: "Forms/ComboBox",
    component: ComboBox,
    tags: ["autodocs"],
  });

  const tokenOptions = [
    { value: "eth", label: "Ethereum", description: "Native token of Ethereum network" },
    { value: "btc", label: "Bitcoin", description: "The original cryptocurrency" },
    { value: "usdc", label: "USD Coin", description: "Circle's USD stablecoin" },
    { value: "dai", label: "DAI", description: "MakerDAO decentralized stablecoin" },
    { value: "uni", label: "Uniswap", description: "Uniswap DEX governance token" },
    { value: "aave", label: "Aave", description: "Aave lending protocol token" },
  ];

  const simpleOptions = [
    { value: "mainnet", label: "Ethereum Mainnet" },
    { value: "goerli", label: "Goerli Testnet" },
    { value: "sepolia", label: "Sepolia Testnet" },
    { value: "polygon", label: "Polygon" },
    { value: "arbitrum", label: "Arbitrum One" },
  ];
</script>

<Story name="Default" args={{ label: "Select Token", options: tokenOptions, placeholder: "Search tokens..." }} />

<Story name="WithDescriptions" args={{ label: "Token", options: tokenOptions, placeholder: "Search..." }} />

<Story name="Loading" args={{ label: "Network", options: [], placeholder: "Fetching networks...", loading: true }} />

<Story name="NoCustom" args={{ label: "Network", options: simpleOptions, placeholder: "Choose a network...", allowCustom: false }} />
