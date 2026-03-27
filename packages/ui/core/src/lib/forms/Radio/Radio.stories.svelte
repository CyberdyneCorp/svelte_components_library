<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Radio from "./Radio.svelte";

  const { Story } = defineMeta({
    title: "Forms/Radio",
    component: Radio,
    tags: ["autodocs"],
  });

  const networkOptions = [
    { value: "eth", label: "Ethereum" },
    { value: "polygon", label: "Polygon" },
    { value: "arbitrum", label: "Arbitrum" },
  ];

  const simpleOptions = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ];

  const planOptions = [
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro" },
    { value: "enterprise", label: "Enterprise" },
  ];
</script>

<Story name="Default" args={{ label: "Select network", options: networkOptions, value: "eth" }} />

<Story name="Disabled" args={{ label: "Disabled group", disabled: true, options: simpleOptions, value: "a" }} />

<Story name="WithError" args={{ label: "Choose a plan", error: "Please select a plan", options: planOptions }} />
