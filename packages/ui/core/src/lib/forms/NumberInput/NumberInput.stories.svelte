<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NumberInput from "./NumberInput.svelte";

  const { Story } = defineMeta({
    title: "Forms/NumberInput",
    component: NumberInput,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <NumberInput label="Quantity" value={1} />
</Story>

<Story name="WithUnit">
  <NumberInput label="Amount" value={0.5} step={0.1} precision={2} unit="ETH" />
</Story>

<Story name="WithRange">
  <NumberInput label="Gas Limit" value={21000} min={21000} max={1000000} step={1000} unit="gas" />
</Story>

<Story name="SmallSize">
  <NumberInput label="Confirmations" value={12} min={1} max={100} size="sm" />
</Story>
