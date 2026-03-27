<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Slider from "./Slider.svelte";

  const { Story } = defineMeta({
    title: "ML/Slider",
    component: Slider,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ value: 50 }} />

<Story name="WithLabel" args={{ label: "Learning Rate", value: 70, min: 0, max: 100, step: 1, unit: "%" }} />

<Story name="Range" args={{ label: "Epochs", value: 50, min: 1, max: 500, step: 10, unit: " epochs" }} />

<Story name="Disabled" args={{ label: "Locked Parameter", value: 42, disabled: true }} />
