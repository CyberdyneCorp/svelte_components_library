<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LiquidityRangeBar from "./LiquidityRangeBar.svelte";
  const { Story } = defineMeta({
    title: "Retro/LiquidityRangeBar",
    component: LiquidityRangeBar,
    tags: ["autodocs"],
    // Axe violations fail the storybook test project for this component.
    parameters: { a11y: { test: "error" } },
  });
</script>

<Story name="InRange" args={{ min: 0.0032, max: 0.0045, lower: 0.0035, upper: 0.0042, current: 0.0039 }} />
<Story name="OutOfRange" args={{ min: 3100, max: 4100, lower: 3200, upper: 3900, current: 4600 }} />
<Story name="NoLabels" args={{ min: 0, max: 100, lower: 40, upper: 60, current: 50, showLabels: false }} />
<Story
  name="Calm"
  globals={{ theme: "calm" }}
  args={{ min: 3100, max: 4100, lower: 3200, upper: 3900, current: 3450, precision: 0 }}
/>
<Story
  name="CalmDark"
  globals={{ theme: "calm-dark" }}
  args={{ min: 3100, max: 4100, lower: 3200, upper: 3900, current: 4600, precision: 0 }}
/>
<Story name="Decorative" asChild globals={{ theme: "calm" }}>
  <div>
    <p>In range: 3,200 to 3,900 USDC per WETH, current price 3,450.</p>
    <div aria-hidden="true">
      <LiquidityRangeBar
        min={3100}
        max={4100}
        lower={3200}
        upper={3900}
        current={3450}
        precision={0}
        decorative
      />
    </div>
  </div>
</Story>
