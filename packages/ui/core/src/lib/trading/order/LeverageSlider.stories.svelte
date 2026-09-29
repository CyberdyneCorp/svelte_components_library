<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LeverageSlider from "./LeverageSlider.svelte";

  const { Story } = defineMeta({
    title: "Trading/LeverageSlider",
    component: LeverageSlider,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for this component.
      a11y: { test: "error" },
    },
  });
</script>

<Story name="Default" args={{ value: 10, max: 50 }} />

<Story name="HighLeverage" args={{ value: 25, max: 125 }} />

<Story name="CustomMarks" args={{ value: 3, max: 20, marks: [1, 2, 5, 10, 20] }} />

<Story name="WithError" args={{ value: 50, max: 50, error: "Leverage above the risk limit" }} />

<Story name="Disabled" args={{ value: 5, max: 50, disabled: true }} />
