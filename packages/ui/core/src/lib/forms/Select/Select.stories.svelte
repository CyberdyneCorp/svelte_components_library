<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Select from "./Select.svelte";

  const { Story } = defineMeta({
    title: "Forms/Select",
    component: Select,
    tags: ["autodocs"],
  });

  const networkOptions = [
    { value: "ethereum", label: "Ethereum Mainnet" },
    { value: "polygon", label: "Polygon" },
    { value: "arbitrum", label: "Arbitrum One" },
    { value: "optimism", label: "Optimism" },
  ];
</script>

<Story name="Default">
  <Select options={networkOptions} placeholder="Choose network..." />
</Story>

<Story name="WithLabel">
  <Select label="Network" options={networkOptions} placeholder="Choose network..." />
</Story>

<Story name="WithError">
  <Select label="Network" options={networkOptions} error="Network selection is required" />
</Story>

<Story name="Disabled">
  <Select label="Network" options={networkOptions} value="ethereum" disabled />
</Story>
