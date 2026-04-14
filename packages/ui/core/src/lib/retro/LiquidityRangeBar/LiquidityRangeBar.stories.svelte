<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LiquidityRangeBar from "./LiquidityRangeBar.svelte";
  const { Story } = defineMeta({ title: "Retro/LiquidityRangeBar", component: LiquidityRangeBar, tags: ["autodocs"] });
</script>

<Story name="InRange" args={{ min: 0.0032, max: 0.0045, lower: 0.0035, upper: 0.0042, current: 0.0039 }} />
<Story name="OutOfRange" args={{ min: 3100, max: 4100, lower: 3200, upper: 3900, current: 4600 }} />
<Story name="NoLabels" args={{ min: 0, max: 100, lower: 40, upper: 60, current: 50, showLabels: false }} />
