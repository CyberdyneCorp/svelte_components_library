<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NumberInput from "./NumberInput.svelte";

  const { Story } = defineMeta({
    title: "Forms/NumberInput",
    component: NumberInput,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ label: "Quantity", value: 1 }} />

<Story name="WithUnit" args={{ label: "Amount", value: 0.5, step: 0.1, precision: 2, unit: "ETH" }} />

<Story name="WithRange" args={{ label: "Gas Limit", value: 21000, min: 21000, max: 1000000, step: 1000, unit: "gas" }} />

<Story name="SmallSize" args={{ label: "Confirmations", value: 12, min: 1, max: 100, size: "sm" }} />
