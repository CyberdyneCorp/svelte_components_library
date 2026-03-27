<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Radio from "./Radio.svelte";

  const { Story } = defineMeta({
    title: "Forms/Radio",
    component: Radio,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <Radio
    label="Select network"
    options={[
      { value: "eth", label: "Ethereum" },
      { value: "polygon", label: "Polygon" },
      { value: "arbitrum", label: "Arbitrum" },
    ]}
    value="eth"
  />
</Story>

<Story name="Disabled">
  <Radio
    label="Disabled group"
    disabled
    options={[
      { value: "a", label: "Option A" },
      { value: "b", label: "Option B" },
    ]}
    value="a"
  />
</Story>

<Story name="WithError">
  <Radio
    label="Choose a plan"
    error="Please select a plan"
    options={[
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
      { value: "enterprise", label: "Enterprise" },
    ]}
  />
</Story>
