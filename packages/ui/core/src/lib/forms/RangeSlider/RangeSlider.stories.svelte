<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import RangeSlider from "./RangeSlider.svelte";

  const { Story } = defineMeta({
    title: "Forms/RangeSlider",
    component: RangeSlider,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <RangeSlider label="Range" low={20} high={80} />
</Story>

<Story name="PriceRange">
  <RangeSlider label="Price Range" min={0} max={10000} step={100} low={1000} high={5000} unit=" USDC" />
</Story>

<Story name="PercentRange">
  <RangeSlider label="Allocation" min={0} max={100} step={5} low={25} high={75} unit="%" />
</Story>
